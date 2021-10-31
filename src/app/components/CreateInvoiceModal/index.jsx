import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import './style.css';

import CreateInvoiceForm from './CreateInvoiceForm';

const propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

const defaultProps = {
  show: false,
};

const CreateInvoiceModal = ({
  show,
  onClose,
  onCreate,
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
      <CreateInvoiceForm
        onCreate={onCreate}
        onClose={onClose}
      />
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" form='createInvoiceForm' type='submit'>Create</Button>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
    </Modal.Footer>
  </Modal>
)

CreateInvoiceModal.propTypes = propTypes;
CreateInvoiceModal.defaultProps = defaultProps;

export default CreateInvoiceModal;
