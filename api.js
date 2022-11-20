const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const _ = require('lodash');

const mongoose = require('mongoose');


const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: 'Welcome to your todolist'
});

const item2 = new Item({
    name: 'Hit the + button to add new item'
});


const item3 = new Item({
    name: '<--Hit this to delete an item'
});


const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get('/', function (req, res) {


    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully saved data items to DB");
                }
            });
            res.redirect('/');
        }
        else {
            res.render('list', { listTitle: "Today", newListItems: foundItems });
        }

    });



});

app.post('/', function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });


    if (listName === 'Today') {
        item.save();
        res.redirect("/");

    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});


app.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;


    if (listName === 'Today') {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log('successfully deleted checked item');
                res.redirect('/');
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, {
            $pull: { items: { _id: checkedItemId } }
        }, function (err, foundList) {
            if (!err) {
                res.redirect('/' + listName);
            }
        });
    }


});





app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);



    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            }
            else {
                //show an existing list

                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

});



app.post('/work', function (req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect('/work');
});

app.get('/about', function (request, response) {

    response.render("about");
});

app.listen(3000, function () {
    console.log("server is running at port 3000");
});