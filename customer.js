 //////////////////////////////////////////////////////////////////////////////
 // nodestore/customer.js
 // Store inventory app (customer view) using Node.js and MySQL
 //
 // 0222 Wednesday, 26 Nisan 5779 (1 May 2019) [EDT] {18017}
 //
 // University of Richmond Coding Boot Camp run by Trilogy Education Services
 // Austin Kim
 //
 // Modified:
 //   2049 Friday, 28 Nisan 5779 (3 May 2019) [EDT] {18019}
 //   0200 Friday, 4 Sivan 5779 (7 June 2019) [EDT] {18054}
 //   2252 Saturday, 5 Sivan 5779 (8 June 2019) [EDT] {18055}
 //   0324 Sunday, 6 Sivan 5779 (9 June 2019) [EDT] {18056}
 //////////////////////////////////////////////////////////////////////////////

 // Require NPM packages
var dotenv = require('dotenv')           // dotenv to read in database password
var mysql = require('mysql')             // MySQL module
var inquirer = require('inquirer')       // Inquirer module

 // Dotenv configuration
dotenv.config()                          // Read database password into env var.

 // center(string):  Center text amid line of hyphens
function center(string) {
  return '-'.repeat(Math.max(Math.floor((process.stdout.columns - string.length)
          / 2), 0)) +
          string +
          '-'.repeat(Math.max(Math.floor((process.stdout.columns - string.length
          + 1) / 2), 0))}

 // idFormat(itemId):  Format itemId to DDD-CC-IIII (department-class-item) fmt
function idFormat(itemId) {
  var ddd = Math.floor(itemId / 1000000)
  var cc = Math.floor(itemId % 1000000 / 10000)
  var iiii = itemId % 10000
  return ddd.toString().padStart(3, '0') + '-' + cc.toString().padStart(2, '0')
    + '-' + iiii.toString().padStart(4, '0')}

 // listItems():  List all items
function listItems() {
  connection.query('SELECT item_id, product, price, stock_quantity FROM ' +
    'nodestoreDB.products', function(err, res) {
    if (err) throw err
      else {
        console.log(center('Product list'))
        for (let i = 0; i !== res.length; ++i) {
          console.log(res[i].product)
          console.log(`    ${idFormat(res[i].item_id)}:  ` +
            `$${res[i].price.toFixed(2)} (${res[i].stock_quantity} in stock)`)}
        console.log(center(''))
        mainMenu()}
    return}) // connection.query(...
  return}

 // purchaseItem():  Purchase an item
function purchaseItem() {
  var itemId, quantity
  inquirer.prompt([{type: 'input', message: 'Item id:', name: 'itemId'}])
    .then(function(inquirerResponse) {
      if (isNaN(itemId = parseInt(inquirerResponse.itemId.replace(/-/g, '')))) {
        console.log('Invalid item no.')
        mainMenu()}
        else connection.query('SELECT item_id, product, price, stock_quantity, '
          + 'product_sales FROM nodestoreDB.products', function(err, res) {
          let i = 0
          while (i !== res.length && res[i].item_id !== itemId) ++i
          if (i === res.length) {
            console.log(`Item no. ${idFormat(itemId)} not on file`)
            mainMenu()}
            else {
              console.log(res[i].product)
              console.log(`    ${idFormat(res[i].item_id)}:  `  +
                `$${res[i].price.toFixed(2)} (${res[i].stock_quantity} in ` +
                `stock)`)
              if (res[i].stock_quantity >= 1) inquirer.prompt([{type: 'input',
                message: 'Quantity to purchase:', name: 'quantity'}])
                .then(function(inquirerResponse) {
                  if (isNaN(quantity = parseInt(inquirerResponse.quantity))) {
                    console.log('Invalid quantity!')
                    mainMenu()}
                    else if (res[i].stock_quantity < quantity) {
                      console.log('Insufficient quantity!')
                      mainMenu()}
                      else {
                        let sales = quantity * res[i].price
                        connection.query('UPDATE nodestoreDB.products ' +
                        'SET ?, ? WHERE ?', [
                          {stock_quantity: res[i].stock_quantity - quantity},
                          {product_sales: res[i].product_sales + sales},
                          {item_id: itemId}],
                        function(err, res) {
                          if (err) console.log('Failed to update!')
                            else console.log(`You have purchased ${quantity} ` +
                              (quantity === 1 ? 'unit ' : 'units ') +
                              `for a total of $${sales.toFixed(2)}`)
                          mainMenu()})
                        }
                  return}) // .then(function(inquirerResponse) {
                else mainMenu()}
          return}) // connection.query('SELECT ...
      return}) // .then(function(inquirerResponse) ...
  return}

 // mainMenu():  Main menu
function mainMenu() {
  inquirer.prompt([{type: 'list', message: 'Selection:', choices:
    ['List items', 'Purchase item', 'Quit'], name: 'selection'}])
    .then(function(inquirerResponse) {
      switch (inquirerResponse.selection) {
        case 'List items':  listItems()
          break
        case 'Purchase item':  purchaseItem()
          break
        case 'Quit':  connection.end()
          }
      return}) // .then(function(inquirerResponse) {
  return}

 // MAIN

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'nodestoreDB'})
connection.connect(function(err) {
  if (err) throw err
    else {
      console.log(`nodestore: Connected as id ${connection.threadId}`)
      console.log(center('WELCOME TO THE NODE STORE'))
      mainMenu()}
  return})
