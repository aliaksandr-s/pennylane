import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

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
  <Modal show={show} onHide={onClose} animation={false}>
    <Modal.Header closeButton>
      <Modal.Title>
        Please confirm your action
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Do you really want to delete this invoice?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={onConfirm}>Delete</Button>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
    </Modal.Footer>
  </Modal>
)

DeleteModal.propTypes = propTypes;
DeleteModal.defaultProps = defaultProps;

export default DeleteModal;
