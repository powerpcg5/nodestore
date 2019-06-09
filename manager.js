 //////////////////////////////////////////////////////////////////////////////
 // nodestore/manager.js
 // Store inventory app (manager view) using Node.js and MySQL
 //
 // 2201 Saturday, 5 Sivan 5779 (8 June 2019) [EDT] {18055}
 //
 // University of Richmond Coding Boot Camp (run by Trilogy Education Services)
 // Austin Kim
 //
 // Modified:
 //   0300 Sunday, 6 Sivan (9 June 2019) [EDT] {18056}
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

 // listLowInventory():  List low inventory
function listLowInventory() {
  connection.query('SELECT item_id, product, price, stock_quantity, ' +
    'low_quantity FROM nodestoreDB.products WHERE stock_quantity < ' +
    'low_quantity', function(err, res) {
    if (err) throw err
      else {
        console.log(center('Low inventory list'))
        for (let i = 0; i !== res.length; ++i) {
          console.log(res[i].product)
          console.log(`    ${idFormat(res[i].item_id)}:  ` +
            `$${res[i].price.toFixed(2)} (${res[i].stock_quantity} in stock ` +
            `< ${res[i].low_quantity} minimum quantity)`)}
        console.log(center(''))
        mainMenu()}
    return}) // connection.query(...
  return}

 // replenishInventory():  Replenish inventory
function replenishInventory() {
  var itemId, quantity
  inquirer.prompt([{type: 'input', message: 'Item id:', name: 'itemId'}])
    .then(function(inquirerResponse) {
      if (isNaN(itemId = parseInt(inquirerResponse.itemId.replace(/-/g, '')))) {
        console.log('Invalid item no.')
        mainMenu()}
        else connection.query('SELECT item_id, product, price, ' +
          'stock_quantity, low_quantity FROM nodestoreDB.products',
          function(err, res) {
          let i = 0
          while (i !== res.length && res[i].item_id !== itemId) ++i
          if (i === res.length) {
            console.log(`Item no. ${idFormat(itemId)} not on file`)
            mainMenu()}
            else {
              console.log(res[i].product)
              console.log(`    ${idFormat(res[i].item_id)}:  `  +
                `$${res[i].price.toFixed(2)} (${res[i].stock_quantity} in ` +
                `stock ` + (res[i].stock_quantity < res[i].low_quantity ? '<' :
                '>=') + ` ${res[i].low_quantity} minimum quantity)`)
              inquirer.prompt([{type: 'input', message:
                'Quantity to add to inventory:', name: 'quantity'}])
                .then(function(inquirerResponse) {
                  if (isNaN(quantity = parseInt(inquirerResponse.quantity))) {
                    console.log('Invalid quantity!')
                    mainMenu()}
                    else {
                      let newQuantity = res[i].stock_quantity + quantity
                      connection.query('UPDATE nodestoreDB.products SET ? ' +
                      'WHERE ?', [
                        {stock_quantity: newQuantity},
                        {item_id: itemId}],
                        function(err, res) {
                          if (err) console.log('Failed to update!')
                            else console.log(`You have added ${quantity} ` +
                              (quantity === 1 ? 'unit ' : 'units ') +
                              `to bring the inventory up to ${newQuantity} ` +
                              (newQuantity === 1 ? 'unit.' : 'units.'))
                          mainMenu()})
                      }
                  return}) // .then(function(inquirerResponse) {
              }
          return}) // connection.query('SELECT ...
      return}) // .then(function(inquirerResponse) ...
  return}

 // addNewProduct():  Add new product (calls createNewProduct() below)
function addNewProduct() {
  var itemId, deptId, department
 // First print department list
  connection.query('SELECT dept_id, department FROM nodestoreDB.departments',
    function(err, res) {
    if (err) throw err
      else {
        console.log(center('Department list'))
        for (let i = 0; i !== res.length; ++i)
          console.log(`${res[i].dept_id.toString().padStart(3, '0')}-xx-xxxx:` +
            `  ${res[i].department}`)
        console.log(center(''))
     // Get department no.
        inquirer.prompt([{type: 'input', message: 'Department id (000--999):',
          name: 'deptId'}])
          .then(function(inquirerResponse) {
            if (isNaN(deptId = parseInt(inquirerResponse.deptId.replace(/-/g,
              '')))) {
              console.log('Invalid department no.')
              mainMenu()}
              else if (deptId < 0 || deptId >= 1000) {
                console.log('Invalid department no.')
                mainMenu()}
                else {
                  let i = 0
                  while (i !== res.length && res[i].dept_id !== deptId) ++i
                  if (i === res.length) {
                    console.log(`Department no. ${deptId.toString().padStart(3,
                      '0')} not on file (use supervisor mode to create)`)
                    mainMenu()}
                    else {
                      department = res[i].department
                      connection.query('SELECT item_id, product FROM ' +
                        'nodestoreDB.products WHERE item_id DIV 1000000 = ?',
                        deptId, function(err, res) {
                        if (err) throw err
                          else {
                            console.log(center('Department ' +
                              deptId.toString().padStart(3, '0') +
                              ' product list'))
                            for (let i = 0; i !== res.length; ++i)
                              console.log(idFormat(res[i].item_id) + ':  ' +
                                res[i].product)
                            console.log(center(''))
                         // Get item no.
                            inquirer.prompt([{type: 'input', message: 'Item ' +
                              'no. (ddd-cc-iiii) to add:', name: 'itemId'}])
                              .then(function(inquirerResponse) {
                                if (isNaN(itemId =
                                  parseInt(inquirerResponse.itemId.replace(/-/g,
                                  '')))) {
                                  console.log('Invalid item no.')
                                  mainMenu()}
                                  else connection.query('SELECT product FROM ' +
                                    'nodestoreDB.products WHERE item_id = ?',
                                    itemId, function(err, res) {
                                    if (err) throw err
                                      else if (res.length === 1) {
                                        console.log('Item no. ' +
                                          idFormat(itemId) +
                                          ' is already on file')
                                        mainMenu()}
                                        else createNewProduct(itemId,
                                          department)
                                    return})
                                return}) // .then(function(inquirerResponse) {
                            } // else
                        return}) // else connection.query('SELECT ...
                      } // else
                  } // else
            return}) // .then(function(inquirerResponse) {
        } // else
    return}) // connection.query('SELECT dept_id, ...
  return}

 // createNewProduct(itemId, department):  Subfunction of addNewProduct() above
function createNewProduct(itemId, department) {
  var product, price, stockQuantity, lowQuantity
 // Get product name
  inquirer.prompt([{type: 'input', message: 'Product name/description:', name:
    'product'}])
    .then(function(inquirerResponse) {
      if ((product = inquirerResponse.product.trim()).length === 0) {
        console.log('Product name/description must not be blank.')
        mainMenu()}
        else {
          product = product.substr(0, 80)
       // Get price
          inquirer.prompt([{type: 'input', message: 'Price: $', name: 'price'}])
            .then(function(inquirerResponse) {
              if ((price = inquirerResponse.price) < 0) {
                console.log('The price may not be a negative value.')
                mainMenu()}
                else if ((price = Math.floor(100 * price) / 100) >= 1000000) {
                  console.log('The price is out of range.')
                  mainMenu()}
               // Get stock quantity
                  else inquirer.prompt([{type: 'input', message:
                    'Stock quantity:', name: 'stockQuantity'}])
                    .then(function(inquirerResponse) {
                      stockQuantity = Math.floor(inquirerResponse.stockQuantity)
                      if (stockQuantity < 0 || stockQuantity >= 1000000) {
                        console.log('The stock quantity is out of range.')
                        mainMenu()}
                     // Get minimum quantity
                        else inquirer.prompt([{type: 'input', message:
                          'Minimum quantity:', name: 'lowQuantity'}])
                          .then(function(inquirerResponse) {
                            lowQuantity =
                              Math.floor(inquirerResponse.lowQuantity)
                            if (lowQuantity < 0 || lowQuantity >= 1000000) {
                              console.log('The minimum quantity is out of ' +
                                'range.')
                              mainMenu()}
                           // Create new product
                              else connection.query('INSERT INTO products SET '
                                + '?, ?, ?, ?, ?, ?, ?', [
                                {item_id: itemId},
                                {product},
                                {department},
                                {price},
                                {stock_quantity: stockQuantity},
                                {low_quantity: lowQuantity},
                                {product_sales: 0}],
                                function(err, res) {
                                  if (err)
                                    console.log('Failed to add new product!')
                                    else console.log('Added new item no. ' +
                                      idFormat(itemId) + ':  ' + product)
                                  mainMenu()
                                  return}) // else connection.query('INSERT ...
                            return}) // .then(function(inquirerResponse) {
                      return}) // .then(function(inquirerResponse) {
              return}) // .then(function(inquirerResponse) {
          } // else
      return}) // .then(function(inquirerResponse) {
  return}

 // mainMenu():  Main menu
function mainMenu() {
  inquirer.prompt([{type: 'list', message: 'Selection:', choices:
    ['List items', 'List low inventory', 'Replenish inventory',
    'Add new product', 'Quit'], name: 'selection'}])
    .then(function(inquirerResponse) {
      switch (inquirerResponse.selection) {
        case 'List items':  listItems()
          break
        case 'List low inventory':  listLowInventory()
          break
        case 'Replenish inventory':  replenishInventory()
          break
        case 'Add new product':  addNewProduct()
          break
        case 'Quit':  connection.end()
          }
      return}) // inquirer.prompt(...
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
      console.log(center('WELCOME TO THE NODE STORE (MANAGER VIEW)'))
      mainMenu()}
  return})
