import { useApi } from "api";
import { 
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";

import InfiniteScroll from 'react-infinite-scroller';

import { useTable } from 'react-table';

import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import BTable from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';

import DeleteInvoiceModal from './components/DeleteInvoiceModal';
import { useToast } from './providers/Toast';

const Table = ({ columns, data }) => {
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
        {rows.map((row, i) => {
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


const App = () => {
  const api = useApi();
  const { showToast } = useToast();
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
      showToast({
        message: 'Something went wrong',
        variant: 'danger',
      })
      console.log(err);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleCloseDeleteInvoiceModal = () => setShowDeleteInvoiceModal(false);
  const handleShowDeleteInvoiceModal = (invoice) => {
    setSelectedInvoice(invoice)
    setShowDeleteInvoiceModal(true)
  };

  const deleteInvoice = useCallback(async (id) => {
    try {
      const { status } = await api.deleteInvoice({ id });

      if (status === 204) {
        setInvoicesList(old => old.filter((invoice) => invoice.id !== id));
      }
      setShowDeleteInvoiceModal(false);
      showToast({
        message: 'Invoice has been removed',
        variant: 'success',
      })
    } catch (err) {
      setShowDeleteInvoiceModal(false);
      showToast({
        message: 'Something went wrong',
        variant: 'danger',
      })
      console.log(err);
    }
  }, [api, showToast]);

  const finalizeInvoice = useCallback(async ({ id }) => {
    console.log(id)
    try {
      const { status } = await api.putInvoice({ id }, {
        finalized: true,
      });

      if (status === 200) {
        setInvoicesList(old => old.map(
          (invoice) => invoice.id === id ? { ...invoice, finalized: true } : {...invoice}
        ));
      }

      showToast({
        message: 'Invoice has been finalized',
        variant: 'success',
      })
    } catch (err) {
      showToast({
        message: 'Something went wrong',
        variant: 'danger',
      })
      console.log(err);
    }
  }, [api, showToast]);


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
        Cell: ({ row }) => { 
          return (
            <Dropdown>
              <Dropdown.Toggle size='sm' variant="primary" id="dropdown-basic"></Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="1">View</Dropdown.Item>
                  <Dropdown.Item eventKey="2">Edit</Dropdown.Item>
                  { !row.original.finalized && 
                    <>
                      <Dropdown.Item eventKey="3" onClick={() => finalizeInvoice(row.original)}>Finalize</Dropdown.Item>
                      <Dropdown.Item eventKey="4" onClick={() => handleShowDeleteInvoiceModal(row.original)}>Delete</Dropdown.Item>
                    </>
                  }
                </Dropdown.Menu>
            </Dropdown>
          )
        }
      },
    ], [finalizeInvoice])

  return (
    <div style={{maxHeight: "100vh", overflowY: "scroll"}}>
      <DeleteInvoiceModal 
        show={showDeleteInvoiceModal}
        onClose={handleCloseDeleteInvoiceModal}
        onConfirm={() => deleteInvoice(selectedInvoice.id)}
      />
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

export default App;
