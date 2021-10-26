import { useApi } from "api";
import { useEffect, useCallback, useState } from "react";
import InfiniteScroll from 'react-infinite-scroller';
 
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
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Customer</th>
                            <th>Address</th>
                            <th>Total</th>
                            <th>Tax</th>
                            <th>Finalized</th>
                            <th>Paid</th>
                            <th>Date</th>
                            <th>Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoicesList.map((invoice) => (<tr key={invoice.id}>
                            <td>{invoice.id}</td>
                            <td>{invoice.customer?.first_name} {invoice.customer?.last_name}</td>
                            <td>{invoice.customer?.address}, {invoice.customer?.zip_code} {invoice.customer?.city}</td>
                            <td>{invoice.total}</td>
                            <td>{invoice.tax}</td>
                            <td>{invoice.finalized ? "Yes" : "No"}</td>
                            <td>{invoice.paid ? "Yes" : "No"}</td>
                            <td>{invoice.date}</td>
                            <td>{invoice.deadline}</td>
                        </tr>))}
                    </tbody>
                </table>
            </InfiniteScroll>
        </div>
    )
}

export default InvoicesList;
