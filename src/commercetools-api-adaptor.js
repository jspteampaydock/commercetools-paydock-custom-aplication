class CommerceToolsAPIAdapter {
    constructor() {
        this.clientId = 'nFppX2eSm4c-JQX8yCAHb_Rd';
        this.clientSecret = 'enCCCsalzqKKZtS4XB3YHo6v5jwfWlm3';
        this.projectKey = 'dev-paydock';
        this.region = 'europe-west1';
        this.accessToken = null;
        this.tokenExpirationTime = null;
    }

    async setAccessToken(accessToken, tokenExpirationInSeconds) {
        this.accessToken = accessToken;
        localStorage.setItem('accessToken', accessToken);
        const tokenExpiration = new Date();
        tokenExpiration.setSeconds(tokenExpiration.getSeconds() + tokenExpirationInSeconds);
        localStorage.setItem('tokenExpiration', tokenExpiration.getTime());
    }

    async getAccessToken() {
        const tokenExpiration = parseInt(localStorage.getItem('tokenExpiration'));
        const currentTimestamp = new Date().getTime();
        if (!this.accessToken && localStorage.getItem('accessToken')) {
            this.accessToken = localStorage.getItem('accessToken');
        }
        if (!this.accessToken || currentTimestamp > tokenExpiration) {
            await this.authenticate();
        }

        return this.accessToken;
    }

    async authenticate() {
        const authUrl = `https://auth.${this.region}.gcp.commercetools.com/oauth/token`;
        const authData = new URLSearchParams();
        authData.append('grant_type', 'client_credentials');
        authData.append('scope', 'manage_project:' + this.projectKey);
        const auth = btoa(`${this.clientId}:${this.clientSecret}`);
        try {
            const response = await fetch(authUrl, {
                headers: {
                    authorization: `Basic ${auth}`,
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: authData.toString(),
                method: 'POST',
            });
            const authResult = await response.json();
            this.setAccessToken(authResult.access_token, authResult.expires_in);
        } catch (error) {
            throw error;
        }
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        const accessToken = await this.getAccessToken();
        const apiUrl = `https://api.${this.region}.gcp.commercetools.com/${this.projectKey}${endpoint}`;
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
                body: body ? JSON.stringify(body) : null,
                method: method,
            });

            if (!response.ok) {
                const error = new Error(`HTTP error! Status: ${response.status}`);
                error.status = response.status;
                throw error;
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    async setConfigs(group, data) {
        let requestData = {
            id: data.id ?? crypto.randomUUID(),
            version: data.version ?? 0,
            createdAt: data.createdAt ?? new Date().toString(),
            lastModifiedAt: new Date().toString(),
            container: 'paydockConfigContainer',
            key: group ?? 'empty',
            value: data.value ?? null,
        };

        return await this.makeRequest('/custom-objects', 'POST', requestData);
    }

    async getConfigs(group) {
        return await this.makeRequest('/custom-objects/paydockConfigContainer/' + group);
    }

    async getLogs() {
        let logs = [];
        let paydockLogs = await this.makeRequest('/custom-objects/paydock-logs?&sort=key+desc');
        let i = 1;
        if (paydockLogs.results) {
            paydockLogs.results.forEach((paydockLog) => {
                let log = {
                    id: i,
                    operation_id: paydockLog.value.paydockChargeID,
                    date: paydockLog.createdAt,
                    operation: paydockLog.value.operation,
                    status: paydockLog.value.status,
                    message: paydockLog.value.message,
                };
                i++;
                logs.push(log);
            });
        }
        return logs;
    }

    async getOrders() {
        try {
            const paydockOrders = [];
            const paymentsArray = [];
            let queryString = encodeURIComponent('paymentMethodInfo(method="paydock-pay")');
            const payments = await this.makeRequest('/payments?where=' + queryString);
            if (payments.results) {
                payments.results.forEach((payment) => {
                    if(payment.custom.fields.AdditionalInformation === undefined){
                        return;
                    }
                    let customFields = payment.custom.fields;
                    let additionalFields = JSON.parse(customFields.AdditionalInformation);
                    paymentsArray[payment.id] = {
                        id: payment.id,
                        amount: payment.amountPlanned.centAmount / 100,
                        currency: payment.amountPlanned.currencyCode,
                        createdAt: payment.createdAt,
                        lastModifiedAt: payment.lastModifiedAt,
                        paymentSourceType: customFields.PaydockPaymentType,
                        paydockPaymentStatus: customFields.PaydockPaymentStatus,
                        paydockChargeId: additionalFields.charge_id,
                    };
                });
            }

            let orderQuery = '"' + Object.keys(paymentsArray).join('","') + '"';

            queryString = encodeURIComponent('paymentInfo(payments(id in(' + orderQuery + ')))');
            const orders = await this.makeRequest('/orders?where=' + queryString+'&sort=createdAt+desc');
            orders.results.forEach((order) => {
                let objOrder = {
                    orderId: order.id,
                    name: order.billingAddress.firstName + ' ' + order.billingAddress.lastName,
                    orderUrl: `https://mc.${this.region}.gcp.commercetools.com/${this.projectKey}/orders/${order.id}/payments`,
                };
                if (order.paymentInfo.payments) {
                    order.paymentInfo.payments.forEach((payment) => {
                        if (paymentsArray[payment.id] !== undefined) {
                            let currentPayment = paymentsArray[payment.id];
                            objOrder.amount = currentPayment.amount;
                            objOrder.currency = currentPayment.currency;
                            objOrder.createdAt = currentPayment.createdAt;
                            objOrder.lastModifiedAt = currentPayment.lastModifiedAt;
                            objOrder.paymentSourceType = currentPayment.paymentSourceType;
                            objOrder.status = currentPayment.paydockPaymentStatus;
                            objOrder.paydockChargeId = currentPayment.paydockChargeId;
                        }
                    });
                }
                paydockOrders.push(objOrder);
            });
            return paydockOrders;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Add more methods for other API endpoints as needed
}

export default CommerceToolsAPIAdapter;