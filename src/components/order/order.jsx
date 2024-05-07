import { useState, useEffect } from 'react';
import Text from '@commercetools-uikit/text';
import { Pagination } from '@commercetools-uikit/pagination';
import messages from './messages';
import styles from './log.module.css';
import './order.css';
import axios from 'axios';
import moment from 'moment';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { ContentNotification } from '@commercetools-uikit/notifications';
import NumberField from '@commercetools-uikit/number-field';
import PulseLoader from 'react-spinners/PulseLoader';
import CommerceToolsAPIAdapter from '../../commercetools-api-adaptor';

const OrdersHistory = () => {
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [currentRows, setCurrentRows] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [rowSuccess, setRowSuccess] = useState({});
    const [typedAmountRefund, setTypedAmountRefund] = useState({});
    const [updateAmountRefund, setUpdateAmountRefund] = useState({});
    const [changeStatus, setChangeStatus] = useState({});
    const [changeDate, setChangeDate] = useState({});
    const [isVisibleInputRefaund, setIsVisibleInputRefaund] = useState({});
    const [isVisibleRefundButtons, setIsVisibleRefundButtons] = useState({});
    const [isVisibleAuthorizedButtons, setIsVisibleAuthorizedButtons] = useState({});
    const [statusUpdated, setStatusUpdated] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [status, setStatus] = useState(null);
    const [statusName, setStatusName] = useState({});
    const [dateUpdated, setDateUpdated] = useState({});
    const [type, setType] = useState(null);
    const [refund, setRefund] = useState(null);
    const [loading, setLoading] = useState({});
    const [sortedColumn, setSortedColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const apiAdapter = new CommerceToolsAPIAdapter();

    const requestUpdateOrder = async (id, status, refund_amount = null, updated_at) => {

        const requestData = {
            orderId: id,
            newStatus: status,
            newDate: updated_at,
        };
        if (refund_amount !== null) requestData.refundAmount = refund_amount;
        let result = await apiAdapter.updateOrderStatus(requestData);
        if (result.success) {
            setStatusUpdated(true);
            setRowSuccess(prevState => ({
                ...prevState,
                [id]: true,
            }));
        } else {
            setRowErrors(prevState => ({
                ...prevState,
                [id]: result.error,
            }));
            setLoading(prevState => ({
                ...prevState,
                [id]: false,
            }));
        }

    };

    useEffect(() => {
        if (statusUpdated) {
            setChangeStatus(prevState => ({
                ...prevState,
                [orderId]: status,
            }));
            setStatusName(prevState => ({
                ...prevState,
                [orderId]: statusName,
            }));
            setChangeDate(prevState => ({
                ...prevState,
                [orderId]: dateUpdated,
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
                if (status === 'paydock-refunded') {
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
                [orderId]: false,
            }));
        }
    }, [statusUpdated, statusName, orderId, status, type, refund, dateUpdated]);

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

        if (rowSuccess) {
            setRowSuccess(prevState => ({
                ...prevState,
                [id]: false,
            }));
        }
        if (rowErrors) {
            setRowErrors(prevState => ({
                ...prevState,
                [id]: false,
            }));
        }

        let newDates = moment().format('YYYY-MM-DD HH:mm:ss');
        if (type === 'capture' || type === 'cancel-authorize') {
            const newStatus = type === 'capture' ? 'paydock-paid' : 'paydock-cancelled';
            const newStatusName = type === 'capture' ? 'Paid via Paydock' : 'Cancelled via Paydock';

            setLoading(prevState => ({
                ...prevState,
                [id]: true,
            }));

            setType(type);
            setStatus(newStatus);
            setStatusName(newStatusName)
            setOrderId(id);
            setDateUpdated(newDates);

            requestUpdateOrder(id, newStatus, null, newDates);
        }

        if (type === 'cancel') {
            const newStatus = 'paydock-cancelled';
            const newStatusName = 'Cancelled via Paydock'

            setLoading(prevState => ({
                ...prevState,
                [id]: true,
            }));

            setType(type);
            setStatus(newStatus);
            setStatusName(newStatusName)
            setOrderId(id);
            setDateUpdated(newDates);

            requestUpdateOrder(id, newStatus, null, newDates);
        }

        if (type === 'submit-refund') {

            let refundAmount;
            let refundAmountUpdate;

            const typedAmount = parseFloat(Number(typedAmountRefund[id]).toFixed(2));
            if (typedAmount <= 0 || typedAmount > amount) return;

            if (updateAmountRefund[id] !== undefined) {
                refundAmountUpdate = parseFloat((Number(updateAmountRefund[id]) + Number(typedAmountRefund[id])).toFixed(2));
            } else {
                refundAmountUpdate = parseFloat(Number(typedAmountRefund[id]).toFixed(2)) || null;
            }

            if (refund_amount !== null && updateAmountRefund[id] === undefined) refundAmountUpdate = refundAmountUpdate + refund_amount;

            refundAmount = parseFloat(Number(typedAmountRefund[id]).toFixed(2)) || null;

            if (refundAmountUpdate > amount) return;

            setLoading(prevState => ({
                ...prevState,
                [id]: true,
            }));

            const newStatus = refundAmountUpdate === amount
              ? 'paydock-refunded'
              : (refundAmountUpdate < amount && refundAmountUpdate > 0)
                ? 'paydock-p-refund'
                : undefined;

            const newStatusName = newStatus === 'paydock-refunded' ? 'Refunded via Paydock' : 'Partial refunded via Paydock';

            setRefund(refundAmountUpdate);
            setType(type);
            setStatus(newStatus);
            setStatusName(newStatusName)
            setOrderId(id);
            setDateUpdated(newDates);

            requestUpdateOrder(id, newStatus, refundAmount, newDates);
        }
    };

    const handleTypedAmountRefund = (e, id) => {
        const value = e.target.value;
        setTypedAmountRefund({ ...typedAmountRefund, [id]: value });
    };

    const columns = [
        { key: 'id', label: 'Commercetools Order ID' },
        { key: 'paydock_transaction', label: 'Paydock Charge ID' },
        { key: 'billing_information', label: 'Billing information' },
        { key: 'shipping_information', label: 'Shipping information' },
        { key: 'amount', label: 'Amount' },
        { key: 'currency', label: 'Currency' },
        { key: 'payment_source_type', label: 'Payment Source Type' },
        { key: 'created_at', label: 'Creation date' },
        { key: 'updated_at', label: 'Last updated date' },
        { key: 'status', label: 'Status' },
        { key: 'action', label: 'Action' },
    ];

    const [page, changePage] = useState(1);
    const [perPage, changePerPage] = useState(20);

    const lastRowIndex = page * perPage;
    const firstRowIndex = lastRowIndex - perPage;

    useEffect(async () => {
        // Виконання запиту до сервера
        let orders = await apiAdapter.getOrders();
        console.log('orders', orders)
        setRows(orders);
        setCurrentRows(rows.slice(firstRowIndex, lastRowIndex));
    }, []);

    useEffect(() => {
        const lastRowIndex = page * perPage;
        const firstRowIndex = lastRowIndex - perPage;

        if (sortedColumn) {
            const sortedRows = [...rows].sort((a, b) => {
                const aValue = a[sortedColumn];
                const bValue = b[sortedColumn];
                if (sortOrder === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
            setCurrentRows(sortedRows.slice(firstRowIndex, lastRowIndex));
        } else {
            setCurrentRows(rows.slice(firstRowIndex, lastRowIndex));
        }
    }, [rows, page, perPage, sortedColumn, sortOrder, firstRowIndex, lastRowIndex]);

    const handleSort = (column) => {
        if (column === 'action') return;

        if (sortedColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortedColumn(column);
            setSortOrder('asc');
        }
    };

    return (
      <>
          <div className={styles.paySettingsHead}>
              <Text.Headline as="h1" intlMessage={messages.pageTitle} />
              {error && (
                <ContentNotification type="error">{error.message}</ContentNotification>
              )}
          </div>

          <div className="table-wrap">
              <table className="table-orders">
                  <thead>
                  <tr>
                      {columns.map((column) => {
                          return <th
                            className={column.key}
                            key={column.key}
                            onClick={(e) => handleSort(column.key)}
                          >
                              {column.label}
                              {sortedColumn === column.key ? (
                                <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                              ) : (
                                column.key !== 'action' && (<span className="sort-default">⇅</span>)
                              )}
                          </th>;
                      })}
                  </tr>
                  </thead>
                  <tbody>
                  {currentRows.map((d, i) => (
                    <tr key={i}>
                        <td className="id">
                            <span className="mobile-label">{columns[0].label}:</span>
                            <a
                              href={`${d.order_url}`}>{d.order_number ?? d.id}</a>
                        </td>
                        <td className="operation transaction">
                            <span className="mobile-label">{columns[1].label}:</span>
                            {d.paydock_transaction}
                        </td>
                        <td className="billing_information">
                            <span className="mobile-label">{columns[2].label}:</span>
                            {d.billing_information}
                        </td>
                        <td className="shipping_information">
                            <span className="mobile-label">{columns[3].label}:</span>
                            {d.shipping_information}
                        </td>
                        <td className="amount">
                            <span className="mobile-label">{columns[4].label}:</span>
                            <span>{changeStatus[d.order_number] === 'paydock-p-refund' || changeStatus[d.order_number] === 'paydock-refunded'
                              ? <>
                                  <span className="refund-base-amount">{d.amount}</span>
                                  {d.amount - updateAmountRefund[d.order_number]}<br />
                                  <span className="refund">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="10" width="10"
                                            viewBox="0 0 512 512"><path
                                            fill="#ff0000"
                                            d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z" /></svg>
                                      &nbsp;{updateAmountRefund[d.order_number]}</span>
                              </>
                              : d.status === 'paydock-p-refund' || d.status === 'paydock-refunded'
                                ? <>
                                    <span className="refund-base-amount">{d.amount}</span>
                                    {d.amount - d.refund_amount}<br />
                                    <span className="refund">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="10" width="10"
                                                 viewBox="0 0 512 512"><path fill="#ff0000"
                                                                             d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z" /></svg>
                                        &nbsp;{d.refund_amount}</span>
                                </>
                                : d.amount}
                                </span>
                        </td>
                        <td className="currency">
                            <span className="mobile-label">{columns[5].label}:</span>
                            AUD
                        </td>
                        <td className="payment-source">
                            <span className="mobile-label">{columns[6].label}:</span>
                            {d.payment_source_type}
                        </td>
                        <td className="date">
                            <span className="mobile-label">{columns[7].label}:</span>
                            {moment(d.created_at).format('YYYY-MM-DD HH:mm:ss')}
                        </td>
                        <td className="date updated_at">
                            <span className="mobile-label">{columns[8].label}:</span>
                            {changeDate[d.order_number] ? moment(changeDate[d.order_number]).format('YYYY-MM-DD HH:mm:ss') : moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                        </td>
                        <td
                          className={`status ${changeStatus[d.order_number] ? changeStatus[d.order_number]: d.status}`}>
                            <span className="mobile-label">{columns[9].label}:</span>
                            <span>{statusName[d.order_number] ? statusName[d.order_number] : d.statusName}</span>
                        </td>
                        <td className="action">
                            <div className="action-wrapper">
                                <span className="mobile-label">{columns[10].label}:</span>
                                {loading[d.order_number] ? <PulseLoader color={'#36d7b7'} loading={loading} size={10} /> : (
                                  <>
                                      {d.status === 'paydock-authorize' && isVisibleAuthorizedButtons[d.order_number] !== false && (
                                        <>
                                            <PrimaryButton
                                              label="Capture Charge"
                                              onClick={() => handleOrderAction('capture', d.order_number)}
                                            />
                                            <SecondaryButton
                                              label="Cancel Charge"
                                              onClick={() => handleOrderAction('cancel-authorize', d.order_number)}
                                            />
                                        </>
                                      )}
                                      {(['paydock-paid', 'paydock-p-refund', 'paydock-requested'].includes(d.status) || isVisibleRefundButtons[d.order_number]) && isVisibleRefundButtons[d.order_number] !== false && (
                                        <>
                                            {isVisibleInputRefaund[d.order_number] ? (
                                              <>
                                                  <NumberField
                                                    title="amount"
                                                    value={typedAmountRefund[d.order_number] || ''}
                                                    onChange={(e) => handleTypedAmountRefund(e, d.order_number)}
                                                    name="amount-refund"
                                                    isRequired={true}
                                                  />
                                                  <PrimaryButton
                                                    label="Refund"
                                                    onClick={() => handleOrderAction('submit-refund', d.order_number, d.amount, d.refund_amount)}
                                                    isDisabled={
                                                        (typedAmountRefund[d.order_number] <= 0 || 
                                                        typedAmountRefund[d.order_number] > d.amount ||
                                                        (typedAmountRefund[d.order_number] > (updateAmountRefund[d.order_number] !== undefined ? d.amount - updateAmountRefund[d.order_number] : d.amount - d.refund_amount) )) ? true : false
                                                    }
                                                  />
                                                  <SecondaryButton
                                                    label="Cancel Charge"
                                                    onClick={() => handleOrderAction('cancel-refund', d.order_number)}
                                                  />
                                              </>
                                            ) : (
                                              <>
                                                  <SecondaryButton
                                                    label="Refund"
                                                    onClick={() => handleOrderAction('refund-btn', d.order_number)}
                                                  />

                                                  {d.status !== 'paydock-refunded' && (
                                                    <PrimaryButton
                                                      label="Cancel Charge"
                                                      onClick={() => handleOrderAction('cancel', d.order_number)}
                                                    />
                                                  )}
                                              </>
                                            )}
                                        </>
                                      )}
                                  </>
                                )}
                            </div>
                            {rowErrors[d.order_number] && (
                              <div className="error-notification">
                                  <ContentNotification
                                    type="error">{rowErrors[d.order_number].message}</ContentNotification>
                              </div>
                            )}
                            {rowSuccess[d.order_number] && (
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
