import {useState, useEffect} from 'react';
import Text from '@commercetools-uikit/text';
import {Pagination} from '@commercetools-uikit/pagination';
import messages from './messages';
import styles from './log.module.css';
import './order.css';
import axios from 'axios';
import moment from 'moment';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import {ContentNotification} from "@commercetools-uikit/notifications";
import NumberField from '@commercetools-uikit/number-field';
import PulseLoader from "react-spinners/PulseLoader";
// eslint-disable-next-line import/extensions
import CommerceToolsAPIAdapter  from '../../commercetools-api-adaptor';


const OrdersHistory = () => {
    const [error, setError] = useState(null);
    const urlApi = 'https://api.paydock-commercetool-app.jetsoftpro.dev/';
    //const urlApi = 'http://localhost:3003/';
    const [rows, setRows] = useState([]);
    const [currentRows, setCurrentRows] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [rowSuccess, setRowSuccess] = useState({});
    const [typedAmountRefund, setTypedAmountRefund] = useState({});
    const [updateAmountRefund, setUpdateAmountRefund] = useState({});
    const [changeStatus, setChangeStatus] = useState({});
    const [isVisibleInputRefaund, setIsVisibleInputRefaund] = useState({});
    const [isVisibleRefundButtons, setIsVisibleRefundButtons] = useState({});
    const [isVisibleAuthorizedButtons, setIsVisibleAuthorizedButtons] = useState({});
    const [statusUpdated, setStatusUpdated] = useState(false); 
    const [orderId, setOrderId] = useState(null);
    const [status, setStatus] = useState(null);
    const [type, setType] = useState(null);
    const [refund, setRefund] = useState(null);
    const [loading, setLoading] = useState({});


    const requestUpdateOrder = (id, status, refund_amount = null) => {
      
        const requestData = { orderId: id , newStatus: status };
        if (refund_amount !== null) requestData.refundAmount = refund_amount;

        axios.post(urlApi + 'update-order', requestData)
            .then(response => {
                if (response.data.success) {
                    setStatusUpdated(true);
                    setRowSuccess(prevState => ({
                        ...prevState,
                        [id]: true
                    }));
                } else {
                    setRowErrors(prevState => ({
                        ...prevState,
                        [id]: response.data.data
                    }));
                    setLoading(prevState => ({
                        ...prevState,
                        [id]: false
                    }));
                }
            })
            .catch(error => {
                console.log('Error:', error);
                setRowErrors(prevState => ({
                    ...prevState,
                    [id]: error
                }));
                setLoading(prevState => ({
                    ...prevState,
                    [id]: false
                }));
            }); 
    };

    useEffect(() => {
        if (statusUpdated) {
            setChangeStatus(prevState => ({
                ...prevState,
                [orderId]: status,
            }));
            if (type === 'capture' || type === 'cancel-authorize') {
                setIsVisibleAuthorizedButtons(prevState => ({
                    ...prevState,
                    [orderId]: false,
                }));
            }
            if (type === 'capture') {
                setIsVisibleRefundButtons(prevState => ({
                    ...prevState,
                    [orderId]: true, 
                }));
                setIsVisibleInputRefaund(prevState => ({
                    ...prevState,
                    [orderId]: false, 
                }));
            }
            if (type === 'cancel') {
                setIsVisibleRefundButtons(prevState => ({
                    ...prevState,
                    [orderId]: false, 
                }));
            }
            if (type === 'submit-refund') {
                setUpdateAmountRefund(prevState => ({
                    ...prevState,
                    [orderId]: refund,
                }));
                if (status === 'Refund via Paydock') {
                    setIsVisibleRefundButtons(prevState => ({
                        ...prevState,
                        [orderId]: false, 
                    }));
                } else {
                    setIsVisibleInputRefaund(prevState => ({
                        ...prevState,
                        [orderId]: false,
                    }));
                    setTypedAmountRefund({});
                }
            }
            setStatusUpdated(false);
            setLoading(prevState => ({
                ...prevState,
                [orderId]: false
            }));
        } 
    }, [statusUpdated, orderId, status, type, refund]);

    const handleOrderAction = (type, id, amount = null, refund_amount = null) => {
        if (type == 'refund-btn') {
            setIsVisibleInputRefaund(prevState => ({
                ...prevState,
                [id]: true,
            }));
        } else if (type == 'cancel-refund') {
            setIsVisibleInputRefaund(prevState => ({
                ...prevState,
                [id]: false,
            }));
        }

        if (type !== 'refund-btn' && type !== 'cancel-refund') {
            setLoading(prevState => ({
                ...prevState,
                [id]: true
            }));
        }

        if (rowSuccess) {
            setRowSuccess(prevState => ({
                ...prevState,
                [id]: false
            }));
        }
        if (rowErrors) {
            setRowErrors(prevState => ({
                ...prevState,
                [id]: false
            }));
        }

        if (type === 'capture' || type === 'cancel-authorize') {
            const newStatus = type === 'capture' ? 'Paid via Paydock' : 'Canceled Authorize via Paydock';
        
            setType(type);
            setStatus(newStatus);
            setOrderId(id);

            requestUpdateOrder(id, newStatus);
        }

        if (type === 'cancel') {
            const newStatus = 'Canceled via Paydock';

            setType(type);
            setStatus(newStatus);
            setOrderId(id);

            requestUpdateOrder(id, newStatus);
        }

        if (type === 'submit-refund') {     
            
            let refundAmount;
            let refundAmountUpdate;

            if (updateAmountRefund[id] !== undefined) {
                refundAmountUpdate = parseFloat((Number(updateAmountRefund[id]) + Number(typedAmountRefund[id])).toFixed(2));
            } else {
                refundAmountUpdate = parseFloat(Number(typedAmountRefund[id]).toFixed(2)) || null;
            }

            if (refund_amount !== null && updateAmountRefund[id] === undefined) refundAmountUpdate = refundAmountUpdate + refund_amount;

            refundAmount = parseFloat(Number(typedAmountRefund[id]).toFixed(2)) || null;

            if (refundAmountUpdate <= 0) return;
            if (refundAmountUpdate > amount) return;

            const newStatus = refundAmountUpdate === amount
                ? 'Refund via Paydock'
                : (refundAmountUpdate < amount && refundAmountUpdate > 0)
                    ? 'Partial refunded via Paydock'
                    : undefined
    
            setRefund(refundAmountUpdate);
            setType(type);
            setStatus(newStatus);
            setOrderId(id);
    
            requestUpdateOrder(id, newStatus, refundAmount);
        }
    };

    const handleTypedAmountRefund = (e, id) => { 
        const value = e.target.value;
        setTypedAmountRefund({...typedAmountRefund, [id]: value})
    }

    const columns = [
        {key: 'id', label: 'Commercetools Order ID'},
        {key: 'paydock_transaction', label: 'Paydock Charge ID'},
        {key: 'name', label: 'Name'},
        {key: 'amount', label: 'Amount'},
        {key: 'currency', label: 'Currency'},
        {key: 'payment_source_type', label: 'Payment Source Type'},
        {key: 'date', label: 'Creation date'},
        {key: 'date_updated', label: 'Last updated date'},
        {key: 'status', label: 'Status'},
        {key: 'action', label: 'Action'},
    ];

    const [page, changePage] = useState(1);
    const [perPage, changePerPage] = useState(20);

    const lastRowIndex = page * perPage;
    const firstRowIndex = lastRowIndex - perPage;

    useEffect(async () => {
        const apiAdapter = new CommerceToolsAPIAdapter();
        let orders = await apiAdapter.getOrders();
        setRows(orders);
        setCurrentRows(rows.slice(firstRowIndex, lastRowIndex))
    }, []);

    useEffect(() => {
        const lastRowIndex = page * perPage;
        const firstRowIndex = lastRowIndex - perPage;
        setCurrentRows(rows.slice(firstRowIndex, lastRowIndex));
    }, [rows, page, perPage]);

    return (
        <>
            <div className={styles.paySettingsHead}>
                <Text.Headline as="h1" intlMessage={messages.pageTitle}/>
                {error && (
                    <ContentNotification type="error">{error.message}</ContentNotification>
                )}
            </div>

            <div className="table-wrap">
                <table className="table-orders">
                    <thead>
                    <tr>
                        {columns.map((row) => {
                            return <th className={row.key} key={row.key}>{row.label}</th>
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {currentRows.map((d, i) => (
                        <tr key={i}>
                            <td className="id">
                                <span className="mobile-label">{columns[0].label}:</span>
                                <a href={`${d.orderUrl}`}>{d.orderId}</a>
                            </td>
                            <td className="operation transaction">
                                <span className="mobile-label">{columns[1].label}:</span>
                                {d.paydockChargeId}
                            </td>
                            <td className="name">
                                <span className="mobile-label">{columns[2].label}:</span>
                                {d.name}
                            </td>
                            <td className="amount">
                                <span className="mobile-label">{columns[3].label}:</span>
                                <span>{changeStatus[d.id] === 'Partial refunded via Paydock' || changeStatus[d.id] === 'Refund via Paydock'
                                        ? <>
                                            <span className="refund-base-amount">{d.amount}</span>
                                            {d.amount - updateAmountRefund[d.id]}<br/>
                                      <span className="refund">
                                          <svg
                                                                                              xmlns="http://www.w3.org/2000/svg"
                                                                                              height="10" width="10"
                                                                                              viewBox="0 0 512 512"><path
                                                                                              fill="#ff0000"
                                                                                              d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z" /></svg>
                                          &nbsp;{updateAmountRefund[d.id]}</span>
                                  </>
                                  : d.status === 'Partial refunded via Paydock' || d.status === 'Refund via Paydock'
                                    ? <>
                                        <span className="refund-base-amount">{d.amount}</span>
                                        {d.amount - d.refund_amount}<br />
                                        <span className="refund">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 512 512"><path fill="#ff0000" d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z" /></svg>
                                            &nbsp;{d.refund_amount}</span>
                                    </>
                                    : d.amount}
                                </span>
                            </td>
                            <td className="currency">
                                <span className="mobile-label">{columns[4].label}:</span>
                                {d.currency}
                            </td>
                            <td className="payment-source">
                                <span className="mobile-label">{columns[5].label}:</span>
                                {d.paymentSourceType}
                            </td>
                            <td className="date">
                                <span className="mobile-label">{columns[6].label}:</span>
                                {moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            </td>
                            <td className="date">
                                <span className="mobile-label">{columns[7].label}:</span>
                                {moment(d.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss')}
                            </td>
                            <td className={`status ${changeStatus[d.id] ? changeStatus[d.id].toLowerCase().replace(/\s+/g, '-') : d.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                <span className="mobile-label">{columns[8].label}:</span>
                                <span>{changeStatus[d.id] ? changeStatus[d.id] : d.status}</span>
                            </td>
                            <td className="action">
                                <div className="action-wrapper"> 
                                    <span className="mobile-label">{columns[9].label}:</span>
                                    {loading[d.id] ? <PulseLoader color={'#36d7b7'} loading={loading} size={10}/> : (
                                        <>       
                                            {d.status === 'Authorized via Paydock' && isVisibleAuthorizedButtons[d.id] !== false && (
                                                <>
                                                    <PrimaryButton
                                                    label="Capture"
                                                    onClick={() => handleOrderAction('capture', d.id)}
                                                    />
                                                    <SecondaryButton
                                                    label="Canceled Authorize"
                                                    onClick={() => handleOrderAction('cancel-authorize', d.id)}
                                                    />
                                                </>
                                            )}            
                                            {(d.status === 'Paid via Paydock' || d.status === 'Partial refunded via Paydock' || isVisibleRefundButtons[d.id]) && isVisibleRefundButtons[d.id] !== false && (
                                                <>
                                                    {isVisibleInputRefaund[d.id] ? (
                                                        <>
                                                            <NumberField
                                                                title="amount"
                                                                value={typedAmountRefund[d.id] || ''}
                                                                onChange={(e) => handleTypedAmountRefund(e, d.id)}
                                                                name="amount-refund"
                                                                isRequired={true}
                                                            />
                                                            <PrimaryButton
                                                                label="Refund"
                                                                onClick={() => handleOrderAction('submit-refund', d.id, d.amount, d.refund_amount)}
                                                            />
                                                            <SecondaryButton
                                                                label="Cancel"
                                                                onClick={() => handleOrderAction('cancel-refund', d.id)}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <SecondaryButton
                                                                label="Refund"
                                                                onClick={() => handleOrderAction('refund-btn', d.id)}
                                                            />

                                                            {d.status !== 'Partial refunded via Paydock' &&  (
                                                                <PrimaryButton
                                                                    label="Cancel"
                                                                    onClick={() => handleOrderAction('cancel', d.id)}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                                {rowErrors[d.id] && (
                                    <div className="error-notification">
                                        <ContentNotification type="error">{rowErrors[d.id].message}</ContentNotification>
                                    </div>
                                )}
                                {rowSuccess[d.id] && (
                                    <div className="success-notification">
                                        <ContentNotification type="success">Updated successfully!</ContentNotification>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Pagination
              totalItems={rows.length}
              page={page}
              perPageRange="s"
              onPageChange={(nextPage) => {
                  changePage(nextPage);
              }}
              perPage={perPage}
              onPerPageChange={(nextPerPage) => {
                  changePerPage(nextPerPage);
                  changePage(1);
              }}
            />

        </>
    );
};

OrdersHistory.displayName = 'OrdersHistory';

export default OrdersHistory;
