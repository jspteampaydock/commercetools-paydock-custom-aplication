import config from '../custom-application-config';
import { CHARGE_STATUSES } from './constants';
import PaydockApiAdaptor from './paydock-api-adaptor';

class CommerceToolsAPIAdapter {
  constructor() {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.projectKey = config.projectKey;
    this.region = config.region;
    this.accessToken = null;
    this.tokenExpirationTime = null;
    this.arrayPaydockStatus = CHARGE_STATUSES;
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
    this.updateAPINotification(group, data.value);
    return await this.makeRequest('/custom-objects', 'POST', requestData);
  }

  updateAPINotification(group, data) {
    const isToken = 'access_key' === data.credentials_type;
    const isLive = group === 'live';
    let secretKey = isToken ? data.credentials_access_key : data.credentials_secret_key;
    if (secretKey) {
      const paydockApiAdaptor = new PaydockApiAdaptor(isLive, isToken, secretKey);
      paydockApiAdaptor.registerNotifications().catch(error => {
        console.log(error.response.data.error)
      });
    }
  }

  async getConfigs(group) {
    return await this.makeRequest('/custom-objects/paydockConfigContainer/' + group);
  }

  async getLogs() {
    let logs = [];
    let paydockLogs = await this.makeRequest('/custom-objects/paydock-logs?&sort=key+desc');
    if (paydockLogs.results) {
      paydockLogs.results.forEach((paydockLog) => {
        let message = typeof paydockLog.value.message === 'string' ? paydockLog.value.message : null;
        let log = {
          operation_id: paydockLog.value.paydockChargeID,
          date: paydockLog.createdAt,
          operation: this.getStatusByKey(paydockLog.value.operation),
          status: paydockLog.value.status,
          message: message,
        };
        logs.push(log);
      });
    }
    return logs;
  }

  getStatusByKey(statusKey) {
    if (this.arrayPaydockStatus[statusKey] !== undefined) {
      return this.arrayPaydockStatus[statusKey];
    }
    return statusKey;
  }


  async collectArrayPayments(payments, paymentsArray) {
    if (!payments.results) return;

    payments.results.forEach((payment) => {
      if (payment.custom.fields.AdditionalInformation === undefined) {
        return;
      }
      let customFields = payment.custom.fields;
      let additionalFields = customFields.AdditionalInformation;
      if (typeof additionalFields !== 'object') {
        additionalFields = JSON.parse(additionalFields);
      }
      let billingInformation = additionalFields.BillingInformation ?? '-';
      let shippingInformation = additionalFields.ShippingInformation ?? '-';
      if (shippingInformation != '-') {
        if (typeof shippingInformation !== 'object') {
          shippingInformation = JSON.parse(shippingInformation);
        }
        shippingInformation = this.convertInfoToString(shippingInformation);
      }
      if (billingInformation !== '-') {
        if (typeof billingInformation !== 'object') {
          billingInformation = JSON.parse(billingInformation);
        }
        billingInformation = this.convertInfoToString(billingInformation);
      }
      shippingInformation = billingInformation == shippingInformation ? '-' : shippingInformation;


      let amount = payment.amountPlanned.centAmount;
      if (payment.amountPlanned.type === 'centPrecision') {
        const fraction = 10 ** payment.amountPlanned.fractionDigits;
        amount = amount / fraction;
      }
      paymentsArray[payment.id] = {
        id: payment.id,
        amount: amount,
        currency: payment.amountPlanned.currencyCode,
        createdAt: payment.createdAt,
        lastModifiedAt: payment.lastModifiedAt,
        paymentSourceType: customFields.PaydockPaymentType,
        paydockPaymentStatus: customFields.PaydockPaymentStatus,
        paydockChargeId: customFields.PaydockTransactionId,
        shippingInfo: shippingInformation,
        billingInfo: billingInformation,
        refundAmount: customFields.RefundedAmount ?? 0,
      };
    });
  }

  convertInfoToString(info) {
    let name = info['name'] ?? '-';
    let address = info['address'] ?? '-';
    return 'Name: ' + name + ' \n' + 'Address: ' + address;
  }

  async getOrders() {
    try {
      const paydockOrders = [];
      const paymentsArray = [];
      const payments = await this.makeRequest('/payments?where=' + encodeURIComponent('paymentMethodInfo(method="paydock-pay") and custom(fields(AdditionalInformation is not empty))') + '&sort=createdAt+desc&limit=500');
      await this.collectArrayPayments(payments, paymentsArray);
      let orderQuery = '"' + Object.keys(paymentsArray).join('","') + '"';
      const orders = await this.makeRequest('/orders?where=' + encodeURIComponent('paymentInfo(payments(id in(' + orderQuery + ')))') + '&sort=createdAt+desc&limit=500');
      await this.collectArrayOrders(orders, paymentsArray, paydockOrders);
      return paydockOrders;
    } catch (error) {
      console.error('Error fetching ordres:', error);
      throw error;
    }
  }

  async updateOrderStatus(data) {

    const orderId = data.orderId;
    let response = {};
    let error = null;

    const payment = await this.makeRequest('/payments/' + orderId);
    if (payment) {
      const requestData = {
        version: payment.version,
        actions: [
          {
            action: 'setCustomField',
            name: 'PaymentExtensionRequest',
            value: JSON.stringify({
              action: 'updatePaymentStatus',
              request: data,
            }),
          },
        ],
      };
      try {
        let updateStatusResponse = await this.makeRequest('/payments/' + orderId, 'POST', requestData);
        let paymentExtensionResponse = updateStatusResponse.custom?.fields?.PaymentExtensionResponse;
        if (!paymentExtensionResponse) {
          error = 'Error update status of payment';
        }
        paymentExtensionResponse = JSON.parse(paymentExtensionResponse);
        if (!paymentExtensionResponse.status) {
          error = paymentExtensionResponse.message;
        }
      } catch (error) {
        return { success: false, message: 'Error update status of payment' };
      }
    } else {
      error = 'Error fetching payment';
    }

    if (error) {
      response = { success: false, message: error };
    } else {
      response = { success: true };
    }

    return response;
  }

  async collectArrayOrders(orders, paymentsArray, paydockOrders) {
    for (const order of orders.results) {
      let objOrder = {
        id: order.id,
        order_number: order.orderNumber,
        order_url: `https://mc.${this.region}.gcp.commercetools.com/${this.projectKey}/orders/${order.id}/payments`,
      };

      if (order.paymentInfo.payments) {
        await this.collectArrayOrdersPayments(order.paymentInfo.payments, paymentsArray, objOrder);
      }
      paydockOrders.push(objOrder);
    }
  }

  async collectArrayOrdersPayments(orderPayments, paymentsArray, objOrder) {
    for (const payment of orderPayments) {
      if (paymentsArray[payment.id] !== undefined) {
        let currentPayment = paymentsArray[payment.id];
        objOrder.amount = currentPayment.amount;
        objOrder.currency = currentPayment.currency;
        objOrder.created_at = currentPayment.createdAt;
        objOrder.updated_at = currentPayment.lastModifiedAt;
        objOrder.payment_source_type = currentPayment.paymentSourceType;
        objOrder.status = currentPayment.paydockPaymentStatus;
        objOrder.statusName = this.getStatusByKey(currentPayment.paydockPaymentStatus);
        objOrder.paydock_transaction = currentPayment.paydockChargeId;
        objOrder.shipping_information = currentPayment.shippingInfo;
        objOrder.billing_information = currentPayment.billingInfo;
        objOrder.refund_amount = currentPayment.refundAmount;
      }
    }
  }

}

export default CommerceToolsAPIAdapter;
