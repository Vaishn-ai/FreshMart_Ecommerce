from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, Product, UserProfile, Address, Cart, PaymentMethod, Order, OrderItem


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        cats = [
            ('Organic','eco','organic'), ('Dairy & Eggs','egg','dairy'),
            ('Bakery','bakery_dining','bakery'), ('Produce','potted_plant','produce'),
        ]
        cat_objs = {}
        for name, icon, slug in cats:
            c, _ = Category.objects.get_or_create(slug=slug, defaults={'name':name,'icon':icon})
            cat_objs[slug] = c

        products = [
            ('Organic Curly Kale', 3.49, None, 'Bunch 250g', 'organic',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuAwQ9dbxwdOkn7TSSO0itgu7N6i5Qw8PnPsgW4GGfe6HfMQzhkrJyqs0NXqdoixov3rtqxiD_kUIbXA3cbjGETZ_fAiED0idmRMxoh7kYahyQvZRVOuq2X-Eztofz9mhHmp--8ZVzenfJ6TnUcYKIzpE-oHEAa_YWo5q75fgxgtbqXzBn-cGcUlWE7yZXKgndr-Yxb1VKzmFPi6OZYJTiG-AXDRmTwYZUFwu6GKaPs_z0VpkL5vpLkWbD3JP-1_kiEeU2UYTljWOVI', 'ORGANIC'),
            ('Hass Avocado', 1.80, None, 'Each', 'organic',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuASSnbPfFKTzSrpguWTOXmKjEaI1oXfJ5htnWbLtrTC_2pGS7rf7xpRZI3HkYGf9Kbugd_CqLwUndQFfOyDxe0Ab1NS6bzKTN2DV0lyVp0UaK-POb9RFJO2MMcVhHGlIH56rGUgwWY3oeqyJlPQ2BiWaelVRBvlQMZ1EMj1I_t9PCs0cq8MUuB5pVyWRD09b5FET0Rybvo1r-qaNRR3Myz-QVrvCKO2HIxJ154HhJd-IYQrbXbZHbYJlQU_8YEbNZOKsxf_OdNMqLk', ''),
            ('Cavendish Bananas', 2.20, 2.75, 'Approx. 1kg', 'produce',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuAQdNFasonOoqRsb7FJQnPGSyXcmeVfv3626wtEIOjblCgLqknkN6yPAmWZumgcIirkyJ6-xmG78cxncmqioBOvZGfXgPSDtj2gwcB4HZmISy1TfDdH-yYYQ7aeDBeXWsY7wZ5n1-A92vC1RJ13OcaI9NGnsO6FIsv5g1EBzdBjo2Ak6DcmNepQxrmgjMFa99xefPE4Wp5lgR1Py8emU7kK9krSjk_Y1t87Hm1iL-BL6nSuN8zE5IIESfl7bZaAb9EEuISnU4fks7s', '-20%'),
            ('Organic Blueberries', 4.50, None, '125g Punnet', 'organic',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuDrcIH-wmrjVs-3cp592y4ZD7kro-bu03BQTTiCJKpYHwCKz6oVMCmHSLiqroT1U1E0ZQ4oiZr1j47It6tVYpmur9xWpVdZXPZ4RgnLoysQoUtbX_WpqQjBUfyn_s2UhRTF5xksxgdqmUdU4ycYcL180NvUZXz2cDHsga0y437P399at_jU1Yc29A9WkusCytLQq-fT69RuuNJ76xx0bLxRO0vUxiC5qsRw', 'ORGANIC'),
            ('Full Cream Milk', 3.80, None, '2L Bottle', 'dairy',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuCIHYUkIvJj6dZVSR9Kf8ppvYznNw1PzPpzN6NmiBhWHMARLeVBQKs4243vp1TKURrrs1Ll8o87B8v917j7U2qnts3p3BAjuQHsiLSfaGVN6R0qzCb6uBRoc5XZiiSwieZLcY49VZhaoPF7LZUVePDi9_xqgMyeiIuWU3TjKXoI4N4NJmgMLcbjAwSsUPJ14xYYW_vHY4_TQxUxp-3SfX_TM7WRrMrZHfYoJcB4rSoXxOnN2AGB2ByBPJucSBzjyt3BX14VGUsc_wY', ''),
            ('Organic Strawberries', 4.99, None, 'Per lb', 'organic',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuCEbhDRzC87RebXblizlAwciCuem_hG4Vik41iGq5YLO26-lUljFaGKSYtV95_bqV5TKW6aHDz2E2TTcIxaS7AncOLQXmEWopYS3pbEVeBQ9agZT86OWN46Qgr4T8vFrQQouzjejMkfKUCXI6-iyWf828IIpOmxELyfpEYkhQ_ed-CZRtg6m8Hr2cxe0Fz2PE9301wEcJf26oN-PJJkSHAg9gETedxtKYWXr1Rt3hoIL2At3XxF6Z-l3OJVEYxawB6LUlqcf9pKB9U', 'FLASH SALE'),
            ('Artisan Sourdough', 4.50, None, '400g', 'bakery',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuBVvzJwDERtNkSqgbQlVCXFGgtLKd4Az-VTsf-A4O6GfjwSFKou33zS4qZgvQOWGYyCE7xDY-fsvOTlqxfgJ7pdo6I8mk6fjC-mtxkjkbwd68EM3D30_Rs0RDPUmfsldz7M1Sxfr-i7XLrYq6tn2c9jF8lf0Yo-r27VfXDLHU2OA-z72HX2Wo-JLvGGl2Q_wwJBGN3IQOK6--2LnVfCNS5ndGnpeoJvPCQDBPBmP-5-TxycrdxjHYdftJFcrF9fyv-iIMxz0G3jjv8', ''),
            ('Pasture-Raised Eggs', 6.49, None, 'Dozen', 'dairy',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuD_MwGaRCUlZ7xPgkXQDP1BsKI-7a_BbM8_eKabNSM2rZVnB_-e73yjw1cGFsEztEFxz23yVa4WX142ZlT-7vXk0ubyhbiHRyqy9gmgNJc4Ue_L5H1jV_G8h9o5x7T0NYEeXUEZcgj8TZqefUsPJY1RiAzadCmrivw-v0q-7rMKwG6sjD1Q032Gilu7A61gLg4jdVu2bf7f-COrIWYbaVNrlZ3bzOb1ibrCOoBlcVAdZBwGETlKVAyNb1kZ-bFT0a6bIxnVkZiRawI', ''),
            ('Navel Oranges', 5.99, None, 'Bag of 6', 'produce',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuCyGmABAwwJPEzRNT_sXl6F2n_IFkAFJxijuHIfznBwudRKz7LX76G3DxOkSJFkwRefP6lrI6rbgNBTCbFrz1yUd1cfMhpyklXlSZPCN6ss1EiXQmk72-Bdej0gxcr2Fd4F_-coF2ozwBl2EKSmjxZ4eoPciPnCsra4Lv5Jpn5I-vZN_isFXtRZauuguzackVJ-2sSsiJVlH3pn78CCFZ4UmS9o0Gf58Mow_-6DXbpFFWxSZkFTa3usSa_mqanyP0gGy6HDkuAWcZ0', ''),
            ('Dutch Carrots', 2.95, None, '500g Pack', 'produce',
             'https://lh3.googleusercontent.com/aida-public/AB6AXuAV4sh8QkOiEZdNh6dWPN5WJa_QWVCFMVfNXvblwIxKTnjNjRyrVniax-lmL4W0XE_eNE9TUx7pZT0X095AjLXQY5isA78kwO_ousUr2-pTnsTYNXIdPHoyohq4hz5YyLu1C_TdxaQJTeQfzr8BG4nG0mzQgav-asYBOtXp7Jvhz6yfkPmdp90GGWQFgi0JMN4c9gy7QaJyAbd0FM9JQtDAaqMm9LOUzcw60iZSvdtloOeGFZZAkvjgKG2n-CjLV9Pe3fqz-dg9Ia8', 'BEST SELLER'),
        ]

        for item in products:
            name, price, orig, unit, cat_slug, img, badge = item
            Product.objects.get_or_create(name=name, defaults={
                'price': price, 'original_price': orig, 'unit': unit,
                'category': cat_objs[cat_slug], 'image_url': img, 'badge': badge
            })

        user, created = User.objects.get_or_create(username='marcus', defaults={
            'first_name': 'Marcus', 'last_name': 'Chen', 'email': 'marcus.chen@example.com'
        })
        if created:
            user.set_password('password123')
            user.save()
            UserProfile.objects.create(user=user, membership='gold', points=2450,
                wallet_balance=42.50,
                avatar_url='https://lh3.googleusercontent.com/aida-public/AB6AXuDtCDYuGv25t2l4Ixt5qtOJuP6p-_4-JhfcLP0UK4G0N2JasVidgG9oh7ik0X17EjkkXzsFur12KhZhrOYj7zACiofapw-cyKnpFFIm7D_7yyw506U5DbYf0fso84S_v-6kaLbB5RaAaVmdP1cHtYn8FuT4gOZ_XxUe1kcvZCCZJI_HEnjqZhJa8yo7RdWdKh5S4I_wKmnbbkpMa4u8bPcgUUzSL8SgaWFCKynxqP6QABcKH3W5Xk8gGR__lGm7Mh_g-Xt7sMZXzB8')
            Cart.objects.create(user=user)
            Address.objects.create(user=user, label='Home', icon='home',
                line1='4521 Oakwood Avenue, Apt 4B', city='Los Angeles', state='CA', zip_code='90024', is_default=True)
            Address.objects.create(user=user, label='Office', icon='work',
                line1='Tech Hub Tower, Suite 500', city='Culver City', state='CA', zip_code='90232')
            PaymentMethod.objects.create(user=user, card_type='VISA', last_four='4412', is_default=True)
            prods = list(Product.objects.all()[:3])
            for onum, ostatus, ototal in [('FMT-89021','in_transit',54.20),('FMT-88944','delivered',112.15),('FMT-88210','delivered',34.90)]:
                o = Order.objects.create(user=user, order_number=onum, status=ostatus,
                    total_amount=ototal, tax=round(ototal*0.07,2),
                    delivery_address=user.addresses.first(), estimated_delivery='Today, 4-6 PM')
                for p in prods:
                    OrderItem.objects.create(order=o, product=p, quantity=2, price_at_purchase=p.price)

        self.stdout.write(self.style.SUCCESS('Done! Login: marcus / password123'))