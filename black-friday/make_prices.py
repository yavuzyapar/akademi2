"""Builds the Black Friday price files from a Shopify products.json export.

    python3 make_prices.py products.json

Writes, next to this script:
  black-friday-prices-import.csv   Shopify product import: sale price + compare-at price
  restore-prices-import.csv        Shopify product import: puts today's prices back
  black-friday-prices-review.csv   the same numbers in a table for checking
  preview-overrides.json           used only by the local preview

Only prices are in the import files (no SKU, stock, image or description
columns), so an import cannot change anything else about a product.

Rule: every product gets its own percentage, larger on higher-priced pieces,
and the sale price ends in .99. The compare-at price is always the price the
product is sold at today, so the crossed-out figure is a real former price.
Edit RATES or the review file before importing if a margin does not allow it.
"""
import csv
import json
import math
import os
import sys

# (minimum current price, base percentage)
RATES = [(150, 20), (90, 20), (40, 15), (0, 15)]
EXTRA_EVERY = 3      # every third product gets 5 points more, so rates differ
EXTRA_POINTS = 5


def base_rate(price):
    for minimum, rate in RATES:
        if price >= minimum:
            return rate
    return RATES[-1][1]


def sale_price(price, rate):
    """Largest .99 price at or below the discounted target (never below 1.99)."""
    target = price * (100 - rate) / 100
    candidate = math.floor(target) + 0.99
    if candidate > target + 1e-9:
        candidate -= 1
    return max(candidate, 1.99)


def main():
    source = sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    products = json.load(open(source))['products']

    header = ['Handle', 'Title', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
              'Option3 Name', 'Option3 Value', 'Variant Price', 'Variant Compare At Price']
    sale_rows, restore_rows, review_rows, overrides = [], [], [], {}

    for index, product in enumerate(sorted(products, key=lambda p: p['handle'])):
        first_price = float(product['variants'][0]['price'])
        rate = base_rate(first_price) + (EXTRA_POINTS if index % EXTRA_EVERY == 0 else 0)
        names = [option['name'] for option in product['options']] + ['', '', '']
        for position, variant in enumerate(product['variants']):
            current = float(variant['price'])
            reduced = sale_price(current, rate)
            actual = round((current - reduced) * 100 / current)
            values = [variant.get('option1') or '', variant.get('option2') or '', variant.get('option3') or '']
            common = [product['handle'], product['title'] if position == 0 else '',
                      names[0] if position == 0 else '', values[0],
                      names[1] if position == 0 else '', values[1],
                      names[2] if position == 0 else '', values[2]]
            sale_rows.append(common + ['%.2f' % reduced, '%.2f' % current])
            restore_rows.append(common + ['%.2f' % current, ''])
            review_rows.append([product['handle'], product['title'], product['product_type'], variant['title'],
                                '%.2f' % current, '%.2f' % reduced, '%.2f' % (current - reduced), '%d%%' % actual])
            overrides[str(variant['id'])] = {'price': round(reduced * 100), 'compare_at_price': round(current * 100)}

    def write(name, head, rows):
        with open(os.path.join(here, name), 'w', newline='', encoding='utf-8') as handle:
            writer = csv.writer(handle)
            writer.writerow(head)
            writer.writerows(rows)

    write('black-friday-prices-import.csv', header, sale_rows)
    write('restore-prices-import.csv', header, restore_rows)
    write('black-friday-prices-review.csv',
          ['Handle', 'Product', 'Type', 'Variant', 'Price today', 'Black Friday price', 'Saving', 'Discount'], review_rows)
    json.dump(overrides, open(os.path.join(here, 'preview-overrides.json'), 'w'))

    per_product = {}
    for row in review_rows:
        per_product.setdefault(row[1], row)
    print('%d products, %d variants' % (len(per_product), len(review_rows)))
    for title, row in per_product.items():
        print('  %-46s %8s -> %8s  %s' % (title[:46], row[4], row[5], row[7]))


if __name__ == '__main__':
    main()
