import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import './style.css';

import CreateInvoiceForm from './CreateInvoiceForm';

const propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

const defaultProps = {
  show: false,
};

const DeleteModal = ({
  show,
  onClose,
  onConfirm,
}) => (   
  <Modal
    show={show} 
    onHide={onClose} 
    animation={false} 
    centered
    size='lg'
    className='create-invoice-modal'
  >
    <Modal.Header closeButton>
      <Modal.Title>
        Create new invoice
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <CreateInvoiceForm />
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={onConfirm}>Create</Button>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
    </Modal.Footer>
  </Modal>
)

DeleteModal.propTypes = propTypes;
DeleteModal.defaultProps = defaultProps;

export default DeleteModal;
