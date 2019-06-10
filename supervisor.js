 //////////////////////////////////////////////////////////////////////////////
 // nodestore/supervisor.js
 // Store inventory app (supervisor view) using Node.js and MySQL
 //
 // 0309 Sunday, 6 Sivan (9 June 2019) [EDT] {18056}
 //
 // University of Richmond Coding Boot Camp (run by Trilogy Education Services)
 // Austin Kim
 //
 // Modified:
 //   2130 Sunday, 6 Sivan (9 June 2019) [EDT] {18056}
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

 // printTable():  Format and print table
function printTable(table) {
  var i, j, maxLen = [], len, str
  if (table.length === 0) return
  if (table[0].length === 0) return
  for (j = 0; j !== table[0].length; ++j) maxLen.push(0)
  for (i = 0; i !== table.length; ++i)
    for (j = 0; j !== table[0].length; ++j)
      if (maxLen[j] < (len = table[i][j].length)) maxLen[j] = len
 // Print table heading
  str = ''
  for (j = 0; j !== table[0].length; ++j)
    str += table[0][j].padEnd(maxLen[j], ' ') + ' '
  console.log('\t' + str.trimEnd())
 // Print table separator
  str = ''
  for (j = 0; j !== table[0].length; ++j)
    str += ''.padEnd(maxLen[j], '-') + ' '
  console.log('\t' + str.trimEnd())
 // Print table rows
  for (i = 1; i !== table.length; ++i) console.log('\t' +
    table[i][0].padEnd(maxLen[0], ' ') + ' ' +
    table[i][1].padEnd(maxLen[1], ' ') + ' ' +
    table[i][2].padStart(maxLen[2], ' ') + ' ' +
    table[i][3].padStart(maxLen[3], ' ') + ' ' +
    table[i][4].padStart(maxLen[4], ' '))
  return}

 // viewSalesByDepartment():  View product sales by department
function viewSalesByDepartment() {
  connection.query('SELECT departments.dept_id, departments.department, ' +
    'SUM(products.product_sales) AS product_sales, departments.overhead, ' +
    'SUM(products.product_sales) - departments.overhead AS net_profit ' +
    'FROM products ' +
    'INNER JOIN departments ' +
    'ON products.department = departments.department ' +
    'GROUP BY departments.dept_id, departments.department', function(err, res) {
    if (err) throw err
      else {
        var row = ['Dept_id', 'Department', 'Product_sales', 'Overhead',
          'Net_profit']
        var table = [row]
        for (let i = 0; i !== res.length; ++i) table.push([
          res[i].dept_id.toString().padStart(3, '0'),
          res[i].department,
          '$' + res[i].product_sales.toFixed(2),
          '$' + res[i].overhead.toFixed(2),
          res[i].net_profit >= 0
            ? '$' + res[i].net_profit.toFixed(2)
            : '-$' + (-res[i].net_profit).toFixed(2)])
        printTable(table)} // else
    mainMenu()
    return}) // connection.query(...
  return}

 // createNewDepartment():  Create new department
function createNewDepartment() {
  var deptId, department, overhead
 // First print department list
  connection.query('SELECT dept_id, department FROM nodestoreDB.departments',
    function(err, res) {
    if (err) throw err
      else {
        console.log(center('Department list'))
        for (let i = 0; i !== res.length; ++i)
          console.log(res[i].dept_id.toString().padStart(3, '0') + ':  ' +
            res[i].department)
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
                  if (i !== res.length) {
                    console.log('Department ' + deptId.toString().padStart(3,
                      '0') + ' is already on file.')
                    mainMenu()}
                 // Get department name
                    else inquirer.prompt([{type: 'input', message:
                      'Department name:', name: 'department'}])
                      .then(function(inquirerResponse) {
                        if ((department =
                          inquirerResponse.department.trim()).length === 0) {
                          console.log('Department name may not be blank.')
                          mainMenu()}
                          else {
                            department = department.substr(0, 64)
                         // Get department overhead cost
                            inquirer.prompt([{type: 'input', message:
                              'Department overhead: $', name: 'overhead'}])
                              .then(function(inquirerResponse) {
                                if (isNaN(overhead =
                                  parseInt(inquirerResponse.overhead))) {
                                  console.log('Invalid overhead cost.')
                                  mainMenu()}
                                  else if (overhead < 0) {
                                    console.log(
                                      'The overhead cost may not be negative.')
                                    mainMenu()}
                                    else if ((overhead = Math.floor(100 *
                                      overhead) / 100) >= 100000000) {
                                      console.log(
                                        'The overhead cost is out of range.')
                                      mainMenu()}
                                   // Create new department
                                      else connection.query(
                                        'INSERT INTO departments SET ?, ?, ?', [
                                        {dept_id: deptId},
                                        {department},
                                        {overhead}],
                                        function(err, res) {
                                          if (err) console.log(
                                            'Failed to create department!')
                                            else console.log(
                                              'Added new department no. ' +
                                              deptId.toString().padStart(3, '0')
                                              + ':  ' + department)
                                          mainMenu()
                                          return}) // function(err, res)
                                return}) // .then(function(inquirerResponse) {
                            } // else
                        return})
                  } // else {
            return}) // .then(function(inquirerResponse) {
        } // else {
    return}) // connection.query('SELECT ...
  return}

 // mainMenu():  Main menu
function mainMenu() {
  inquirer.prompt([{type: 'list', message: 'Selection:', choices:
    ['View sales by department', 'Create new department', 'Quit'],
    name: 'selection'}])
    .then(function(inquirerResponse) {
      switch (inquirerResponse.selection) {
        case 'View sales by department':  viewSalesByDepartment()
          break
        case 'Create new department':  createNewDepartment()
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
      console.log(center('WELCOME TO THE NODE STORE (SUPERVISOR VIEW)'))
      mainMenu()}
  return})
