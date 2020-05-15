# Name: Jay Patel (jjp107)
# CS 1520 (Monday 5:30PM): Project 4
from flask import Flask, render_template
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)
app.config['TEMPLATES_AUTO_RELOAD'] = True

CATS = [
]
parser = reqparse.RequestParser()
parser.add_argument('cat_id')

PURCHASES = [

]
parser.add_argument('purchase_id')


def abort_no_category(cat_id):
    if not any(cat['cat_id'] == int(cat_id) for cat in CATS):
        abort(404, message="Category {} doesn't exist".format(cat_id))


def abort_no_purchase(purchase_id):
    if not any(p['purchase_id'] == int(purchase_id) for p in PURCHASES):
        abort(404, message="Purchase {} doesn't exist".format(purchase_id))


@app.route("/")
def root_page():
    return render_template("main.html")


class Category(Resource):
    def get(self, cat_id):
        abort_no_category(cat_id)
        return CATS[cat_id]

    def delete(self, cat_id):
        abort_no_category(cat_id)
        cat = [c for c in CATS if c['cat_id'] == int(cat_id)]
        for p in PURCHASES:
            if p['cat'] == cat[0]['name']:
                p.update({'cat': "NONE"})
        CATS[:] = [cat for cat in CATS if cat['cat_id'] != int(cat_id)]
        return '', 204


class Categories(Resource):
    def get(self):
        return CATS[:]

    def post(self):
        parser.add_argument('name')
        parser.add_argument('budget')
        args = parser.parse_args()
        new_cat = {}
        if [c['cat_id'] for c in CATS]:
            new_cat['cat_id'] = max([c['cat_id'] for c in CATS]) + 1
        else:
            new_cat['cat_id'] = 1
        new_cat['name'] = args['name']
        new_cat['budget'] = int(args['budget'])
        CATS.append(new_cat)
        return CATS[len([c for c in CATS if c])-1], 201


class Purchase(Resource):
    def get(self, purchase_id):
        abort_no_purchase(purchase_id)
        return PURCHASES[purchase_id]

    def delete(self, purchase_id):
        abort_no_purchase(purchase_id)
        PURCHASES[:] = [
            p for p in PURCHASES if p['purchase_id'] != int(purchase_id)]
        return '', 204


class Purchases(Resource):
    def get(self):
        return PURCHASES

    def post(self):
        parser.add_argument('name')
        parser.add_argument('purchaseAmount')
        parser.add_argument('cat')
        parser.add_argument('date')
        args = parser.parse_args()

        new_purchase = {}
        if [p['purchase_id'] for p in PURCHASES]:
            new_purchase['purchase_id'] = max(
                [p['purchase_id'] for p in PURCHASES]) + 1
        else:
            new_purchase['purchase_id'] = 1
        new_purchase['name'] = args['name']
        new_purchase['purchaseAmount'] = float(args['purchaseAmount'])
        new_purchase['cat'] = args['cat']
        new_purchase['date'] = args['date']
        PURCHASES.append(new_purchase)
        return PURCHASES[len([p for p in PURCHASES if p])-1], 201


##
# Actually setup the Api resource routing here
##
api.add_resource(Categories, '/cats')
api.add_resource(Category, '/cats/<cat_id>')
api.add_resource(Purchases, '/purchases')
api.add_resource(Purchase, '/purchases/<purchase_id>')

if __name__ == "__main__":
    app.run()
