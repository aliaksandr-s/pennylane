import { useApi } from "api";
import { 
  useEffect,
  useCallback,
  useState,
} from "react";

import InfiniteScroll from 'react-infinite-scroller';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Button from 'react-bootstrap/Button';

import DeleteInvoiceModal from './components/DeleteInvoiceModal';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import InvoicesTable from './components/InvoicesTable';
import { useToast } from './providers/Toast';

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
      // console.log(data)

      // We don't want to get duplicates when we add newly created invoice to the table and then
      // fetch it again when we scroll. If we had sorting in the API we could do better. 
      const getFiltered = (oldInv, newInv) => newInv.filter(inv => !oldInv.some(i => i.id === inv.id))

      setInvoicesList(invoicesList => [...invoicesList, ...getFiltered(invoicesList, data.invoices)]);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      showToast({
        message: 'Could not get invoices list',
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

  const updateInvoice = useCallback(async ({ id }, data) => {
    try {
      const { status } = await api.putInvoice({ id } , data);

      if (status === 200) {
        setInvoicesList(old => old.map(
          (invoice) => invoice.id === id ? { ...invoice, ...data } : {...invoice}
        ));

        showToast({
          message: 'Invoice has been updated',
          variant: 'success',
        })
      }
    } catch (err) {
      showToast({
        message: 'Something went wrong',
        variant: 'danger',
      })
      console.log(err);
    }
  }, [api, showToast]);

  const finalizeInvoice = useCallback((invoice) => {
    updateInvoice(invoice, { finalized: true })
  }, [updateInvoice])

  const markAsPaid = useCallback((invoice) => {
    updateInvoice(invoice, { paid: true })
  }, [updateInvoice])

  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const handleCreateInvoice = (invoice) => {
    setInvoicesList(invoices => [invoice, ...invoices]);
    setShowCreateInvoiceModal(false);
  }

  return (
    <div style={{maxHeight: "100vh", overflowY: "scroll"}}>
      <DeleteInvoiceModal 
        show={showDeleteInvoiceModal}
        onClose={handleCloseDeleteInvoiceModal}
        onConfirm={() => deleteInvoice(selectedInvoice.id)}
      />
      <CreateInvoiceModal 
        show={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onCreate={handleCreateInvoice}
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
        <InvoicesTable
          data={invoicesList}
          finalizeInvoice={finalizeInvoice}
          handleShowDeleteInvoiceModal={handleShowDeleteInvoiceModal}
          markAsPaid={markAsPaid}
        />
      </InfiniteScroll>
      <Button
        className="add-button" 
        variant='success'
        onClick={() => setShowCreateInvoiceModal(true)}
      >
        +
      </Button>
    </div>
  )
}

export default App;
