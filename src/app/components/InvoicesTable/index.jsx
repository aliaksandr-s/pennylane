import { useMemo } from "react";
import { arrayOf, object, func } from 'prop-types';
import { useTable } from 'react-table';

import BTable from 'react-bootstrap/Table';
import ActionsDropdown from './ActionsDropdown';

const propTypes = {
  data: arrayOf(object),
  finalizeInvoice: func.isRequired,
  handleShowDeleteInvoiceModal: func.isRequired,
  markAsPaid: func.isRequired,
};

const defaultProps = {
  data: [],
}

const InvoicesTable = ({
  data,
  finalizeInvoice,
  handleShowDeleteInvoiceModal,
  markAsPaid,
}) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'id',
      }, {
        Header: 'Customer',
        Cell: ({ row }) => ( 
          <span>
            { row.original.customer.first_name } { row.original.customer.last_name }
          </span>
        ),
        accessor: 'customer.first_name',
      }, {
        Header: 'Address',
        accessor: 'customer.address',
      }, {
        Header: 'Total',
        accessor: 'total',
      }, {
        Header: 'Tax',
        accessor: 'tax',
      }, {
        Header: 'Finalized',
        accessor: 'finalized',
        Cell: ({ row }) => ( 
          <span>
            { row.original.finalized && 'Yes' }
            { !row.original.finalized && 'No' }
          </span>
        ),
      }, {
        Header: 'Paid',
        accessor: 'paid',
        Cell: ({ row }) => ( 
          <span>
            { row.original.paid && 'Yes' }
            { !row.original.paid && 'No' }
          </span>
        )
      }, {
        Header: 'Date',
        accessor: 'date',
      }, {
        Header: 'Deadline',
        accessor: 'deadline',
      },{
        Header: 'Actions',
        Cell: ({ row }) => ( 
          <ActionsDropdown 
            finalizeInvoice={finalizeInvoice}
            handleShowDeleteInvoiceModal={handleShowDeleteInvoiceModal}
            markAsPaid={markAsPaid}
            row={row}
          />
        )
      },
    ], [finalizeInvoice, markAsPaid, handleShowDeleteInvoiceModal])

  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  })

  return (
    <BTable bordered hover size="sm" {...getTableProps()}>
      <thead className="sticky-header">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </BTable>
  )
}

InvoicesTable.defaultProps = defaultProps;
InvoicesTable.propTypes = propTypes;

export default InvoicesTable
