

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Alert, Row, Col, Modal, Accordion } from 'react-bootstrap';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import './styles.css'; // Import the custom CSS file

function App() {
  const [domain, setDomain] = useState('');
  const [productSitemapUrls, setProductSitemapUrls] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [visibleProducts, setVisibleProducts] = useState(5);

  const handleDomainChange = (e) => {
    setDomain(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProducts([]);
    setVisibleProducts(5);

    try {
      const response = await axios.post('http://localhost:3002/scrape', { domain });
      setProductSitemapUrls(response.data.productSitemapUrls);
      setProducts(response.data.products);
    } catch (err) {
      setError('An error occurred while scraping');
    }
  };

  const handleImageClick = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDownload = () => {
    fetch(modalImageSrc)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product-image';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Download failed:', err));
  };

  const showMoreProducts = () => {
    setVisibleProducts(prevVisibleProducts => prevVisibleProducts + 5);
  };

  return (
    <Container className="my-5">
      <Typography variant="h4" gutterBottom>Web Scraper</Typography>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="domain">
          <Form.Label>Enter domain name</Form.Label>
          <Form.Control
            type="text"
            value={domain}
            onChange={handleDomainChange}
            placeholder="example.com"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Scrape
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {products.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5">Product Sitemap URLs:</Typography>
          {productSitemapUrls.map((url, index) => (
            <Typography key={index} variant="body1">{url}</Typography>
          ))}
          <Row className="mt-4">
            {products.slice(0, visibleProducts).map((product, index) => (
              <Col key={index} md={4} className="mb-4 d-flex justify-content-center">
                <Card className="card" style={{ width: '100%' }}>
                  <div
                    className="card-img-container"
                    onClick={() => handleImageClick(product.image)}
                  >
                    <Card.Img variant="top" src={product.image} />
                  </div>
                  <Card.Body className="card-body">
                    <Card.Title className="card-title">{product.title}</Card.Title>
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>View Summary</Accordion.Header>
                        <Accordion.Body>
                          <Card.Text className="card-summary">{product.summary}</Card.Text>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Card.Link href={product.loc} target="_blank" rel="noopener noreferrer">
                      View Product
                    </Card.Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {visibleProducts < products.length && (
            <Button onClick={showMoreProducts} className="mt-3">Show More</Button>
          )}
        </Box>
      )}

      {/* Modal for displaying the larger image */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Product Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={modalImageSrc} alt="Product" className="img-fluid" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownload}>
            Download Image
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;
