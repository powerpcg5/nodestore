USE nodestoreDB;
SELECT departments.dept_id, departments.department,
  SUM(products.product_sales) AS total_sales, departments.overhead,
  SUM(products.product_sales) - departments.overhead AS net_total_sales
FROM products
INNER JOIN departments
ON products.department = departments.department
GROUP BY departments.dept_id, departments.department
