import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from "api";
import { useToast } from 'app/providers/Toast';

import { AsyncPaginate } from 'react-select-async-paginate';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import './style.css';

const CreateInvoiceForm = () => { 
  const api = useApi();
  const { showToast } = useToast();

  const [productInputs, setProductInputs] = useState([
    {id: 1, qty: 0},
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isFormValid, setIsFormValid] = useState(true);

  const getLocalProductId = () => {
    if (!productInputs.length) return 1;

    const highestId = productInputs.sort((a,b) => a.id - b.id)[productInputs.length - 1]['id'];
    return highestId + 1;
  }

  const deleteProductInput = (id) => {
    setProductInputs(productInputs => productInputs.filter(input => input.id !== id))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!selectedCustomer || !productInputs.some(input => input.product && input.qty)) {
      setIsFormValid(false);
      return;
    }

    const data = {
      customer_id: selectedCustomer.value,
      date: event.target.date.value,
      deadline: event.target.deadline.value,
      invoice_lines: productInputs.map(productInput => ({
        product_id: productInput.product.id,
        quantity: productInput.qty,
      })), 
    }
    // I tried multiple data formats to create invoice lines alongside invoice
    // but none of them worked for me
    createInvoice(data);
  }

  const fetchCustomers = async (search, _, { page }) => {
    try {
      const { data } = await api.getSearchCustomers({
        query: search,
        page,
      });

      return {
        options: data.customers.map(customer => ({ 
          value: customer.id,
          label: `${customer.first_name} ${customer.last_name}`,
        })),
        hasMore: data.pagination.page < data.pagination.total_pages,
        additional: {
          page: page + 1,
        },
      }
    } catch (err) {
      showToast({
        message: 'Could not get customers list',
        variant: 'danger',
      })
      console.log(err);
    }
  };

  const fetchProducts = async (search, _, { page }) => {
    try {
      const { data } = await api.getSearchProducts({
        query: search,
        page,
      });

      return {
        options: data.products.map(product => ({ 
          value: product.id,
          id: product.id,
          label: `${product.label} (price: ${product.unit_price})`,
          tax: product.unit_tax,
          priceWithoutTax: product.unit_price_without_tax,
        })),
        hasMore: data.pagination.page < data.pagination.total_pages,
        additional: {
          page: page + 1,
        },
      }
    } catch (err) {
      showToast({
        message: 'Could not get products list',
        variant: 'danger',
      })
      console.log(err);
    }
  };

  const createInvoice = async (invoice) => {
    try {
      const resp = await api.postInvoices(null, {
        invoice: {
          customer_id: 4,
          date: "2021-02-03",
          deadline: "2021-02-03",
          invoice_lines: [{
            product_id: 11,
            quantity: 3,
          }],
        }
      });
      console.log(resp)

    } catch (err) {
      showToast({
        message: 'Error when creating invoice',
        variant: 'danger',
      })
      console.log(err);
    }
  };

  const handleSelectProduct = (input) => {
    return (product) => {
      setIsFormValid(true);
      setProductInputs(inputs => inputs.map(
        inp => inp.id === input.id ? { ...input, product: product } : { ...inp }
      ))
    }
  }

  const handleChangeProductQty = (input) => {
    return (event) => {
      const value = Number(event.target.value);

      setProductInputs(inputs => inputs.map(
        inp => inp.id === input.id ? { ...input, qty: value } : { ...inp }
      ))
    }
  }

  const countTotal = (productInputs, key) => {
    if (!productInputs.length) return 0;

    return productInputs.reduce((prev, cur) => {
      if (!cur.product || !cur.qty) return prev;
      return prev + Number(cur.product[key]) * cur.qty
    }, 0);
  }

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsFormValid(true);
  }

  return ( 
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" name="date" required/>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Deadline</Form.Label>
            <Form.Control type="date" name="deadline" required/>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <div className="mb-2">Customer</div>
        <AsyncPaginate
          loadOptions={fetchCustomers}
          additional={{
            page: 1,
          }}
          name="customer"
          onChange={handleSelectCustomer}
        />
      </Form.Group>
      {!isFormValid && !selectedCustomer && 
        <Alert variant='danger'>Please select customer</Alert>
      }
      {productInputs.map(input => (
        <Row className="product-row" key={input.id}>
          <Col sm="9">
            <Form.Group controlId="formBasicEmail">
              <div className="mb-2">Product {input.id}</div>
              <AsyncPaginate
                loadOptions={fetchProducts}
                additional={{
                  page: 1,
                }}
                name="product"
                onChange={handleSelectProduct(input)}
              />
            </Form.Group>
          </Col>
          <Col sm="2">
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Qty</Form.Label>
              <Form.Control onChange={handleChangeProductQty(input)} type="number" min="1" name="product-qty" />
            </Form.Group>
          </Col>
          {productInputs.length > 1 &&
            <Col sm="1" className="pt-3">
              <Button onClick={() => deleteProductInput(input.id)} size="sm" variant="danger">X</Button>
            </Col>
          }
        </Row>
      ))}
      {!isFormValid && !productInputs.some(input => input.product && input.qty) && 
        <Alert variant='danger'>Please select at least one product</Alert>
      }
      <Row className="mb-3">
        <Col>
          <Button 
            size="sm" 
            variant="success"
            onClick={() => setProductInputs(qty => [...qty, {id: getLocalProductId()}])}
          >
            Add product
          </Button>
        </Col>
      </Row>
      <div className="total-section">
          <div className="font-weight-bold">Total:</div>
          <div>{countTotal(productInputs, 'priceWithoutTax').toFixed(2)}</div>
          <div className="font-weight-bold">Tax:</div>
          <div>{countTotal(productInputs, 'tax').toFixed(2)}</div>
          <div className="font-weight-bold">Total with tax:</div>
          <div>{(countTotal(productInputs, 'priceWithoutTax') + countTotal(productInputs, 'tax')).toFixed(2)}</div>
      </div>
      <br/>
      <br/>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
)}

export default CreateInvoiceForm;
