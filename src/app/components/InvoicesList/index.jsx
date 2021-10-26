import { useApi } from "api";
import { useEffect, useCallback, useState, useMemo } from "react";
import InfiniteScroll from 'react-infinite-scroller';

import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import BTable from 'react-bootstrap/Table';
import { useTable } from 'react-table';

const Table = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  })

  return (
    <BTable bordered size="sm" {...getTableProps()}>
      <thead class="sticky-header">
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
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {

                console.log('Cell', cell.getCellProps())
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

const InvoicesList = () => {
  const api = useApi();
  const [invoicesList, setInvoicesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInvoices = useCallback(async (nextPage, totalPages) => {
    if (nextPage > totalPages) return;

    try {
      const { data } = await api.getInvoices({
        per_page: 30,
        page: nextPage,
      });

      setInvoicesList(invoicesList => [...invoicesList, ...data.invoices]);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);
      console.log(data);
    } catch (err) {
      // could be a sentry call and notification for users in production;
      console.log(err);
    }
  }, [api]);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'customer_id',
      }, {
        Header: 'Customer',
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
      },

    ], [])

  return (
    <div style={{maxHeight: "100vh", overflowY: "scroll"}}>
      <InfiniteScroll
        initialLoad={true}
        pageStart={0}
        loadMore={() => fetchInvoices(currentPage + 1, totalPages)}
        hasMore={currentPage < totalPages}
        useWindow={false}
        loader={
          <div key="loading" className="loader">
            Loading ...
          </div>
        }
      >
        <Table columns={columns} data={invoicesList} />
      </InfiniteScroll>
    </div>
  )
}

export default InvoicesList;
