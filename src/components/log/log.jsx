import {useState, useEffect} from 'react';
import Text from '@commercetools-uikit/text';
import {Pagination} from '@commercetools-uikit/pagination';
import messages from './messages';
import styles from './log.module.css';
import './log.css';
import moment from 'moment';
import {ContentNotification} from "@commercetools-uikit/notifications";
import CommerceToolsAPIAdapter from '../../commercetools-api-adaptor';

const LogsHistory = () => {
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [currentRows, setCurrentRows] = useState([]);

    const columns = [
        {key: 'id', label: 'ID'},
        {key: 'operation_id', label: 'Paydock Charge ID'},
        {key: 'date', label: 'Date'},
        {key: 'operation', label: 'Operation'},
        {key: 'status', label: 'Status'},
        {key: 'message', label: 'Message'},
    ];

    const [page, changePage] = useState(1);
    const [perPage, changePerPage] = useState(20);

    const lastRowIndex = page * perPage;
    const firstRowIndex = lastRowIndex - perPage;

    useEffect(async () => {
        const apiAdapter = new CommerceToolsAPIAdapter();
        let logs = await apiAdapter.getLogs();
        setRows(logs);
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
                <table className='table-logs'>
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
                            <td className='id'>{d.id}</td>
                            <td className='operation_id'>{d.operation_id}</td>
                            <td className='date'>{moment(d.date).format('YYYY-MM-DD HH:mm:ss')}</td>
                            <td className='operation'>{d.operation}</td>
                            <td className={`status ${d.status}`}><span>{d.status}</span></td>
                            <td className='message'>{d.message}</td>
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

LogsHistory.displayName = 'LogsHistory';

export default LogsHistory;
