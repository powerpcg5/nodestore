-------------------------------------------------------------------------------
--  nodestore/schema.sql
--  schema.sql for _nodestore_ store inventory app using Node.js and MySQL
--
--  2155 Monday, 24 Nisan 5779 (29 April 2019) [EDT] {18015}
--
--  University of Richmond Coding Boot Camp run by Trilogy Education Services
--  Austin Kim
--
--  Modified:
--    2339 Tuesday, 25 Nisan 5779 (30 April 2019) [EDT] {18016}
--    0154 Wednesday, 26 Nisan 5779 (1 May 2019) [EDT] {18017}
--    1959 Sunday, 6 Sivan 5779 (9 June 2019) [EDT] {18056}
-------------------------------------------------------------------------------

DROP DATABASE IF EXISTS nodestoreDB;
CREATE DATABASE nodestoreDB;

USE nodestoreDB;

--  Create, load, and display _products_ table

CREATE TABLE products (
  --  Item ID (a nine-digit number) in the format 123-45-6789, where:
  --    123 is the 3-digit department number (= corresponding dept_id),
  --    45 is the 2-digit class number, and
  --    6789 is the 4-digit item number
  item_id         INTEGER(9)  NOT NULL,
  product         VARCHAR(80)     NULL, --  Product name
  department      VARCHAR(64)     NULL, --  Department name
  price           DECIMAL(8, 2)   NULL, --  Price (cost to customer) in U. S. $
  stock_quantity  INTEGER(6)      NULL, --  Quantity of product in stock
  low_quantity    INTEGER(6)      NULL, --  Minimum quantity needed to keep in
                                        --    stock (below which trigger order)
  product_sales   DECIMAL(10, 2)  NULL, --  Total sales of product in U. S. $
  PRIMARY KEY (item_id)
  );
--  LOAD DATA INFILE 'products.csv'
--    INTO TABLE products
--    FIELDS TERMINATED BY ','
--    ENCLOSED BY '"'
--    LINES TERMINATED BY '\n'
--    IGNORE 1 ROWS;
SELECT * FROM products;                 --  Display contents of products table

--  Create, load, and display _departments_ table

CREATE TABLE departments (
  --  Department ID (a three-digit number) = first three digits of the item ID
  --    for all items that fall under this department
  dept_id         INTEGER(3)  NOT NULL,
  department      VARCHAR(64)     NULL, --  Department name
  overhead        DECIMAL(10, 2)  NULL, --  Total overhead costs for department
  PRIMARY KEY (dept_id)
  );
--  LOAD DATA INFILE 'departments.csv'
--    INTO TABLE departments
--    FIELDS TERMINATED BY ','
--    ENCLOSED BY '"'
--    LINES TERMINATED BY '\n'
--    IGNORE 1 ROWS;
SELECT * FROM departments               -- Display contents of departments table
