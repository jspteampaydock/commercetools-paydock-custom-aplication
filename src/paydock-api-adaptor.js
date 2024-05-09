import { API_LIVE_URL, API_SANDBOX_URL, NOTIFICATIONS } from './constants';
import config from '../custom-application-config';

const axios = require('axios');

class PaydockApiAdaptor {
  constructor(isLive, isToken, secretKey) {
    this.apiUrl = isLive ? API_LIVE_URL : API_SANDBOX_URL;
    this.isToken = isToken;
    this.secretKey = secretKey;
  }


  async registerNotifications() {
    const notificationUrl = config.notificationUrl;
    const registeredEvents = await this.fetchRegisteredEvents();
    NOTIFICATIONS.forEach((event) => {
      if (!registeredEvents.includes(event)) {
        this.callToAPI('v1/notifications', 'POST', {
          destination: notificationUrl,
          type: 'webhook',
          event: event,
          transaction_only: false,
        });
      }
    });
  }

  async fetchRegisteredEvents() {
    const notificationUrl = config.notificationUrl;
    const result = await this.callToAPI('v1/notifications', 'GET', null);
    let allNotifications = [];
    if (result) {
      allNotifications = result.data.resource.data;
      return allNotifications.filter(notification => notification.destination === notificationUrl)
        .map(notification => notification.event);

    }
    return [];
  }

  async callToAPI(action, method, data) {
    let config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    config.headers[this.isToken ? 'x-access-token' : 'x-user-secret-key'] = this.secretKey;
    let result = {};
    if (method === 'GET') {
      result = await axios.get(`${this.apiUrl}/${action}`, config);
    } else {
      result = await axios.post(`${this.apiUrl}/${action}`, data, config);
    }
    return result;
  }
}

export default PaydockApiAdaptor;
