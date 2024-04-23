import axios from 'axios';

const disabledOption = 'Disable';
const enabledPayment = 'Yes';
const sandboxApiUrl = 'https://api-sandbox.paydock.com/v1';
const liveApiUrl = 'https://api.paydock.com/v1';
const gatewaysConfig = [
    'bank_accounts',
    'card',
    'wallets_apple_pay',
    'wallets_google_pay',
    'wallets_paypal_smart_button',
    'wallets_afterpay_v2',
    'alternative_payment_methods_afterpay_v1',
    'alternative_payment_methods_zippay',
];

class ValidationPaydockData {
    constructor(data) {
        this.data = data;
    }

    async validateSandbox() {
        await this.checkCredentials(sandboxApiUrl);
        await this.validateGateways();
        await this.fraudServices();
        await this.threeDSServices();
    }

    async validateLive() {
        await this.checkCredentials(liveApiUrl);
        await this.validateGateways();
        await this.fraudServices();
        await this.threeDSServices();
    }

    validationStyles() {

    }

    async validateGateways() {
        let errorFields = {};
        let hasError = false;

        gatewaysConfig.forEach((item) => {
            let field = item + '_gateway_id';
            if ((enabledPayment === this.data[item + '_use_on_checkout'])
              && !this.checkGateway(this.data[field])) {
                hasError = true;
                errorFields[field] = { required: true };
            }
        });
        if (hasError) {
            const error = new Error('Validation error: Invalid gateway IDs.' + JSON.stringify(errorFields));
            error.data = errorFields;
            throw error;
        }
    }

    async fraudServices() {
        let errorFields = {};
        let hasError = false;
        gatewaysConfig.forEach((item) => {
            if(item === 'bank_accounts'){
                return;
            }
            let field = item + '_fraud_service_id';
            if ((enabledPayment === this.data[item + '_use_on_checkout'])
              && (disabledOption !== this.data[item + '_fraud'])
              && !this.checkService(this.data[field])) {
                hasError = true;
                errorFields[field] = { required: true };
            }
        });

        if (hasError) {
            const error = new Error('Validation error: Invalid fraud service IDs .(Detail error: '+ JSON.stringify(errorFields) + ' )');
            error.data = errorFields;
            throw error;
        }
    }

    async threeDSServices() {
        if ((enabledPayment === this.data.card_use_on_checkout)
          && (disabledOption !== this.data.card_3ds)
          && !this.checkService(this.data.card_3ds_service_id)
        ) {
            const error = new Error('Validation error: Invalid 3ds service ID.');
            error.data.card_3ds_service_id = { required: true };
            throw error;
        }
    }

    checkGateway(gatewayId) {
        return !!this.gatewaysIds.find((element) => element._id === gatewayId);
    }

    checkService(serviceId) {
        return !!this.servicesIds.find((element) => element._id === serviceId);
    }

    async checkCredentials(baseUrl) {
        const publicHeaders = {
            headers: {
                'Content-Type': 'application/json',
                'x-user-public-key': this.data.credentials_public_key,
            },
        };
        const secretHeaders = {
            headers: {
                'Content-Type': 'application/json',
                'x-user-secret-key': this.data.credentials_secret_key,
            },
        };
        try {
            if ('credentials' === this.data.credentials_type) {
                await axios.post(baseUrl + '/payment_sources/tokens', {
                    gateway_id: '',
                    type: '',
                }, publicHeaders);

                const searchParams = new URLSearchParams({
                    limit: 1000,
                }).toString();

                this.gatewaysIds = (await axios.get(baseUrl + '/gateways?' + searchParams, secretHeaders))?.data?.resource?.data ?? [];
                this.servicesIds = (await axios.get(baseUrl + '/services?' + searchParams, secretHeaders))?.data?.resource?.data ?? [];
            }
        } catch (error) {
            error.message = 'Validation error: Invalid credentials.';
            error.data = {
                credentials_public_key: { required: true },
                credentials_secret_key: { required: true },
            };

            throw error;
        }
    }
}

export default ValidationPaydockData;