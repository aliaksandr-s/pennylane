import { object, func } from 'prop-types';

import Dropdown from 'react-bootstrap/Dropdown';

const propTypes = {
  row: object.isRequired,
  finalizeInvoice: func.isRequired,
  handleShowDeleteInvoiceModal: func.isRequired,
  markAsPaid: func.isRequired,
};

const ActionsDropdown = ({
  finalizeInvoice,
  handleShowDeleteInvoiceModal,
  markAsPaid,
  row,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle size='sm' variant="primary" id="dropdown-basic"></Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item eventKey="2">Edit <span className="small-text">(tbd)</span></Dropdown.Item>
        { !row.original.finalized && 
        <>
          <Dropdown.Item eventKey="3" onClick={() => finalizeInvoice(row.original)}>Finalize</Dropdown.Item>
          <Dropdown.Item eventKey="4" onClick={() => handleShowDeleteInvoiceModal(row.original)}>Delete</Dropdown.Item>
        </>
        }
        {
          !row.original.paid &&
            <Dropdown.Item eventKey="5" onClick={() => markAsPaid(row.original)}>Mark as paid</Dropdown.Item>
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

ActionsDropdown.propTypes = propTypes;

export default ActionsDropdown;
