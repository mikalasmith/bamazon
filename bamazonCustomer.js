require('dotenv').config()

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.password,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Successful connection! ' + connection.threadId);
    display();
});

function display() {
    console.log("inside function display")
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].item_id + " || " + results[i].product_name + "|| " + results[i].department_name + " || " + results[i].price + " || " + results[i].stock_quantity + "\n");
        }
        inquirer
            .prompt([
                {
                    name: "itemId",
                    type: "input",
                    message: "What is the item ID of the product you'd like to buy?",
                    validate: function (itemid) {
                        if (isNaN(itemid)) {
                            console.log("Please enter a valid id number")
                        }
                        return true;

                    }
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "What is the quantity that you would like to buy?",
                    validate: function (value) {
                        if (isNaN(value)) {
                            return false;
                        }
                        return true;

                    }
                }
            ]).then(function (answer) {
                var query = "SELECT price, stock_quantity FROM products WHERE ?";
                var id = parseInt(answer.itemId);
                connection.query(query, { item_id: id }, function (err, res) {
                    if (err) {
                        console.log("Choose a valid item id number.");
                    }
                    console.log(res);


                    if (res[0].stock_quantity >= parseInt(answer.quantity)) {
                        var temp = res[0].stock_quantity - parseInt(answer.quantity);
                        connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: temp }, { item_id: id }], function (err, updateRes) {
                            if (err) console.log(err)

                            // console.log("Quantity Updated");
                            var p = res[0].price * parseInt(answer.quantity);
                            console.log("Total Cost: $" + p +".00");
                        })
                    }
                    else {
                        console.log("Insufficient quantity!");
                    }
                    console.log("Purchase successful!")
                    // updatedTable()

                    connection.end();
                });
            });

    });
};


// function updatedTable() {
//     console.log("inside function display")
//     connection.query("SELECT * FROM products", function (err, results) {
//         if (err) throw err;
//         for (var i = 0; i < results.length; i++) {
//             console.log(results[i].item_id + " || " + results[i].product_name + "|| " + results[i].department_name + " || " + results[i].price + " || " + results[i].stock_quantity + "\n");
//         }    
//     }   
// };
