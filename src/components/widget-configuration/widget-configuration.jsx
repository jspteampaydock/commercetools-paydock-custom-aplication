import {useIntl} from 'react-intl';
import PropTypes from 'prop-types';
import {useFormik} from 'formik';
import {useState, useEffect} from 'react';
import Text from '@commercetools-uikit/text';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import TextField from '@commercetools-uikit/text-field';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import SelectField from '@commercetools-uikit/select-field';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Constraints from '@commercetools-uikit/constraints';
import Spacings from '@commercetools-uikit/spacings';
import {ContentNotification} from '@commercetools-uikit/notifications';
import messages from './messages';
import styles from './widget-configuration.module.css';
import './widget-configuration.css';
import validate from './validate';
import ColorPicker from './color-picker';
import PulseLoader from "react-spinners/PulseLoader";
import CommerceToolsAPIAdapter from '../../commercetools-api-adaptor';
import { INITIAL_SANDBOX_CONNECTION_FORM, INITIAL_WIDGET_FORM } from '../../constants';


const WidgetConfigurationForm = () => {
    const intl = useIntl();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const group = 'widget';
    const [id, setId] = useState(null);
    const [version, setVersion] = useState(null);
    const [createdAt, setCreatedAt] = useState(null);
    const apiAdapter = new CommerceToolsAPIAdapter();

    const version_version_options = [
        {value: 'Latest', label: 'Latest'},
        {value: 'Custom', label: 'Custom'},
    ];

    const widget_style_font_size_options = [
        {value: '8px', label: '8'},
        {value: '10px', label: '10'},
        {value: '12px', label: '12'},
        {value: '14px', label: '14'},
        {value: '16px', label: '16'},
        {value: '18px', label: '18'},
        {value: '20px', label: '20'},
        {value: '22px', label: '22'},
        {value: '24px', label: '24'},
        {value: '26px', label: '26'},
        {value: '28px', label: '28'},
        {value: '30px', label: '30'},
        {value: '32px', label: '32'},
    ];

    const widget_style_font_family_options = [
        {value: 'serif', label: 'serif'},
        {value: 'sans-serif', label: 'sans-serif'},
        {value: 'monospace', label: 'monospace'},
        {value: 'cursive', label: 'cursive'},
        {value: 'fantasy', label: 'monfantasyspace'},
        {value: 'system-ui', label: 'system-ui'},
        {value: 'ui-serif', label: 'ui-serif'},
        {value: 'ui-sans-serif', label: 'ui-sans-serif'},
        {value: 'ui-monospace', label: 'ui-monospace'},
        {value: 'ui-rounded', label: 'ui-rounded'},
        {value: 'emoji', label: 'emoji'},
        {value: 'math', label: 'math'},
        {value: 'fangsong', label: 'fangsong'},
    ];

    const [initialValues, setInitialValues] = useState({
        version_version: 'Custom',
        version_custom_version: '',
        payment_methods_cards_title: '',
        payment_methods_cards_description: '',
        payment_methods_bank_accounts_title: '',
        payment_methods_bank_accounts_description: '',
        payment_methods_wallets_apple_pay_title: '',
        payment_methods_wallets_apple_pay_description: '',
        payment_methods_wallets_google_pay_title: '',
        payment_methods_wallets_google_pay_description: '',
        payment_methods_wallets_afterpay_v2_title: '',
        payment_methods_wallets_afterpay_v2_description: '',
        payment_methods_wallets_paypal_title: '',
        payment_methods_wallets_paypal_description: '',
        payment_methods_alternative_payment_method_afterpay_v1_title: '',
        payment_methods_alternative_payment_method_afterpay_v1_description: '',
        payment_methods_alternative_payment_method_zip_title: '',
        payment_methods_alternative_payment_method_zip_description: '',
        widget_style_bg_color: '#D9D9D9',
        widget_style_text_color: '#000000',
        widget_style_border_color: '#000000',
        widget_style_error_color: '#E71313',
        widget_style_success_color: '#51B97C',
        widget_style_font_size: '14px',
        widget_style_font_family: 'ui-rounded',
        widget_style_custom_element: '',
    });

    const customElementStyles = {
        "input": {
            "color": "rgb(0, 0, 0)",
            "border": "dashed red;",
            "border_radius": "30px",
            "background_color": "rgba(255, 255, 255, 0.9)",
            "height": "20px",
            "text_decoration": "underline",
            "font_size": "20px",
            "font_family": "serif",
            "transition": "margin-right 2s",
            "line_height": "20",
            "font_weight": "400",
            "padding": "2",
            "margin": "2"
        },
        "label": {
            "color": "rgb(0, 0, 0)",
            "text_decoration": "underline",
            "font_size": "20px",
            "font_family": "serif",
            "line_height": "20",
            "font_weight": "400",
            "padding": "2",
            "margin": "2"
        },
        "title": {
            "color": "rgb(0, 0, 0)",
            "text_decoration": "underline",
            "font_size": "20px",
            "font_family": "serif",
            "line_height": "20",
            "font_weight": "400",
            "padding": "2",
            "margin": "2",
            "text-align": "center"
        },
        "title_description": {
            "color": "rgb(0, 0, 0)",
            "text_decoration": "underline",
            "font_size": "20px",
            "font_family": "serif",
            "line_height": "20",
            "font_weight": "400",
            "padding": "2",
            "margin": "2",
            "text-align": "center"
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: async (values, formik) => {

            if (success) setSuccess(false);
            if (error) setError(false);
            setLoading(true);

            try {
                apiAdapter.setConfigs(group, {
                    id: id,
                    version: version,
                    createdAt: createdAt,
                    value: values,
                })
                  .then((response) => {
                      setVersion(response.version ?? null);
                      setId(response.id ?? null);
                      setCreatedAt(response.createdAt ?? null);

                      setSuccess(true);
                      setLoading(false);
                  }).catch((error) => {
                    setError({message: error.message});
                    setLoading(false);
                });
            } catch (error) {
                setError({message: error.message});
                formik.setErrors(error.data);
                setLoading(false);
            }
        },
        validate,
        enableReinitialize: true,
    });

    const getConfig = () => {
        return apiAdapter.getConfigs(group).then((response) => {
            setVersion(response.version ?? null);
            setId(response.id ?? null);
            setCreatedAt(response.createdAt ?? null);

            if (response.value) {
                let merged = { ...formik.values, ...response.value };
                formik.setValues(merged);
            }
        });
    }

    useEffect(() => {
        let result = {};
        for (const property in messages) {
            result[messages[property]['id']] = messages[property]['defaultMessage']
        }
        getConfig().catch((error) => {
            if (404 === error.status) {
                apiAdapter.setConfigs(group,{
                    id: null,
                    version: null,
                    createdAt: null,
                    value: INITIAL_SANDBOX_CONNECTION_FORM
                }).then(() => getConfig().catch((error) => {
                    setError({ message: error.message });
                }))
            }else{
                setError({ message: error.message });
            }
        });
    }, []);

    return (
        <>
            <div className={styles.paySettingsHead}>
                <Text.Headline as="h1" intlMessage={messages.pageTitle}/>
                <Text.Body intlMessage={messages.pageSubtitle}/>

                <div className={styles.paySettingsButtonWrap}>
                    {error && (
                        <ContentNotification type="error">{error.message}</ContentNotification>
                    )}
                    {success && (
                        <ContentNotification type="success">Your settings have been saved</ContentNotification>
                    )}
                    <div>
                        {loading ? <PulseLoader color={'#36d7b7'} loading={loading} size={10}/> : (
                            <>
                                <SecondaryButton
                                    onClick={() => {
                                        if (success) setSuccess(false);
                                        if (error) setError(false);
                                        formik.handleReset
                                    }}
                                    isDisabled={formik.isSubmitting}
                                    label="Cancel"
                                />
                                <PrimaryButton
                                    type="submit"
                                    label="Save"
                                    onClick={formik.handleSubmit}
                                    isDisabled={formik.isSubmitting || !formik.dirty}
                                />
                           </>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>

                <CollapsiblePanel header="Version" isDefaultClosed={false} className="collapsible-panel">
                    <Constraints.Horizontal max={'scale'}>
                        <Spacings.Stack scale="xl">

                            <SelectField
                                name="version_version"
                                title={intl.formatMessage(messages.selectVersion)}
                                isMulti={false}
                                value={formik.values.version_version}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                options={version_version_options}
                                isSearchable={false}
                                isClearable={false}
                                isRequired={false}
                            />

                            <TextField
                                name="version_custom_version"
                                title={intl.formatMessage(messages.customVersion)}
                                value={formik.values.version_custom_version}
                                touched={formik.touched.version_custom_version}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isRequired={false}
                            />

                        </Spacings.Stack>
                    </Constraints.Horizontal>
                </CollapsiblePanel>


                <CollapsiblePanel header="Payment methods" isDefaultClosed={false} className="collapsible-panel">
                    <Constraints.Horizontal max={'scale'}>
                        <Spacings.Stack scale="xl">

                            <ContentNotification
                                type="info">{intl.formatMessage(messages.paymentMethodsNotificationInfo)}</ContentNotification><br/>

                            <CollapsiblePanel header="Cards" isDefaultClosed={false} className="collapsible-panel">
                                <Constraints.Horizontal max={'scale'}>
                                    <Spacings.Stack scale="xl">

                                        <TextField
                                            name="payment_methods_cards_title"
                                            title={intl.formatMessage(messages.paymentMethodsTitle)}
                                            value={formik.values.payment_methods_cards_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_cards_title}
                                            touched={formik.touched.payment_methods_cards_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_cards_description"
                                            title={intl.formatMessage(messages.paymentMethodsDescription)}
                                            value={formik.values.payment_methods_cards_description}
                                            touched={formik.touched.payment_methods_cards_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />

                                    </Spacings.Stack>
                                </Constraints.Horizontal>
                            </CollapsiblePanel>

                            <CollapsiblePanel header="Bank accounts" isDefaultClosed={true}
                                              className="collapsible-panel hide">
                                <Constraints.Horizontal max={'scale'}>
                                    <Spacings.Stack scale="xl">

                                        <TextField
                                            name="payment_methods_bank_accounts_title"
                                            title={intl.formatMessage(messages.paymentMethodsTitle)}
                                            value={formik.values.payment_methods_bank_accounts_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_bank_accounts_title}
                                            touched={formik.touched.payment_methods_bank_accounts_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_bank_accounts_description"
                                            title={intl.formatMessage(messages.paymentMethodsDescription)}
                                            value={formik.values.payment_methods_bank_accounts_description}
                                            touched={formik.touched.payment_methods_bank_accounts_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />

                                    </Spacings.Stack>
                                </Constraints.Horizontal>
                            </CollapsiblePanel>

                            <CollapsiblePanel header="Wallets" isDefaultClosed={true} className="collapsible-panel">
                                <Constraints.Horizontal max={'scale'}>
                                    <Spacings.Stack scale="xl">

                                        <TextField
                                            name="payment_methods_wallets_apple_pay_title"
                                            title={intl.formatMessage(messages.paymentMethodsApplePayTitle)}
                                            value={formik.values.payment_methods_wallets_apple_pay_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_wallets_apple_pay_title}
                                            touched={formik.touched.payment_methods_wallets_apple_pay_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_wallets_apple_pay_description"
                                            title={intl.formatMessage(messages.paymentMethodsApplePayDescription)}
                                            value={formik.values.payment_methods_wallets_apple_pay_description}
                                            touched={formik.touched.payment_methods_wallets_apple_pay_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />

                                        <TextField
                                            name="payment_methods_wallets_google_pay_title"
                                            title={intl.formatMessage(messages.paymentMethodsGooglePayTitle)}
                                            value={formik.values.payment_methods_wallets_google_pay_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_wallets_google_pay_title}
                                            touched={formik.touched.payment_methods_wallets_google_pay_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_wallets_google_pay_description"
                                            title={intl.formatMessage(messages.paymentMethodsGooglePayDescription)}
                                            value={formik.values.payment_methods_wallets_google_pay_description}
                                            touched={formik.touched.payment_methods_wallets_google_pay_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />
                                        {/*
                                        <TextField
                                            name="payment_methods_wallets_afterpay_v2_title"
                                            title={intl.formatMessage(messages.paymentMethodsAfterpayV2Title)}
                                            value={formik.values.payment_methods_wallets_afterpay_v2_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_wallets_afterpay_v2_title}
                                            touched={formik.touched.payment_methods_wallets_afterpay_v2_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_wallets_afterpay_v2_description"
                                            title={intl.formatMessage(messages.paymentMethodsAfterpayV2Description)}
                                            value={formik.values.payment_methods_wallets_afterpay_v2_description}
                                            touched={formik.touched.payment_methods_wallets_afterpay_v2_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />
                                        */}
                                        <TextField
                                            name="payment_methods_wallets_paypal_title"
                                            title={intl.formatMessage(messages.paymentMethodsPaypalTitle)}
                                            value={formik.values.payment_methods_wallets_paypal_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_wallets_paypal_title}
                                            touched={formik.touched.payment_methods_wallets_paypal_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_wallets_paypal_description"
                                            title={intl.formatMessage(messages.paymentMethodsPaypalDescription)}
                                            value={formik.values.payment_methods_wallets_paypal_description}
                                            touched={formik.touched.payment_methods_wallets_paypal_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />

                                    </Spacings.Stack>
                                </Constraints.Horizontal>
                            </CollapsiblePanel>

                            <CollapsiblePanel header="Alternative Payment Methods" isDefaultClosed={true}
                                              className="collapsible-panel">
                                <Constraints.Horizontal max={'scale'}>
                                    <Spacings.Stack scale="xl">

                                        <TextField
                                            name="payment_methods_alternative_payment_method_afterpay_v1_title"
                                            title={intl.formatMessage(messages.paymentMethodsAfterpayV1Title)}
                                            value={formik.values.payment_methods_alternative_payment_method_afterpay_v1_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_alternative_payment_method_afterpay_v1_title}
                                            touched={formik.touched.payment_methods_alternative_payment_method_afterpay_v1_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_alternative_payment_method_afterpay_v1_description"
                                            title={intl.formatMessage(messages.paymentMethodsAfterpayV1Description)}
                                            value={formik.values.payment_methods_alternative_payment_method_afterpay_v1_description}
                                            touched={formik.touched.payment_methods_alternative_payment_method_afterpay_v1_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />

                                        <TextField
                                            name="payment_methods_alternative_payment_method_zip_title"
                                            title={intl.formatMessage(messages.paymentMethodsZipTitle)}
                                            value={formik.values.payment_methods_alternative_payment_method_zip_title}
                                            errors={TextField.toFieldErrors(formik.errors).payment_methods_alternative_payment_method_zip_title}
                                            touched={formik.touched.payment_methods_alternative_payment_method_zip_title}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={true}
                                        />

                                        <TextField
                                            name="payment_methods_alternative_payment_method_zip_description"
                                            title={intl.formatMessage(messages.paymentMethodsZipDescription)}
                                            value={formik.values.payment_methods_alternative_payment_method_zip_description}
                                            touched={formik.touched.payment_methods_alternative_payment_method_zip_description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isRequired={false}
                                        />

                                    </Spacings.Stack>
                                </Constraints.Horizontal>
                            </CollapsiblePanel>

                        </Spacings.Stack>
                    </Constraints.Horizontal>
                </CollapsiblePanel>


                <CollapsiblePanel header="Widget style" isDefaultClosed={false} className="collapsible-panel">
                    <Constraints.Horizontal max={'scale'}>
                        <Spacings.Stack scale="xl">

                            <ContentNotification
                                type="info">{intl.formatMessage(messages.widgetStyleNotificationInfo)}</ContentNotification>

                            <ColorPicker color={formik.values.widget_style_bg_color} name="widget_style_bg_color"
                                         formik={formik}
                                         title={intl.formatMessage(messages.backgroundColor)}/>

                            <ColorPicker color={formik.values.widget_style_text_color} name="widget_style_text_color"
                                         formik={formik}
                                         title={intl.formatMessage(messages.textColor)}/>

                            <ColorPicker color={formik.values.widget_style_border_color}
                                         name="widget_style_border_color"
                                         formik={formik}
                                         title={intl.formatMessage(messages.borderColor)}/>

                            <ColorPicker color={formik.values.widget_style_error_color} name="widget_style_error_color"
                                         formik={formik}
                                         title={intl.formatMessage(messages.errorColor)}/>

                            <ColorPicker color={formik.values.widget_style_success_color}
                                         name="widget_style_success_color"
                                         formik={formik}
                                         title={intl.formatMessage(messages.successColor)}/>

                            <SelectField
                                name="widget_style_font_size"
                                title={intl.formatMessage(messages.widgetStyleFontSizeTitle)}
                                isMulti={false}
                                value={formik.values.widget_style_font_size}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                options={widget_style_font_size_options}
                                isSearchable={false}
                                isClearable={false}
                                isRequired={false}
                            />

                            <SelectField
                                name="widget_style_font_family"
                                title={intl.formatMessage(messages.widgetStyleFontFamilyTitle)}
                                isMulti={false}
                                value={formik.values.widget_style_font_family}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                options={widget_style_font_family_options}
                                isSearchable={false}
                                isClearable={false}
                                isRequired={false}
                            />

                            <MultilineTextField
                                name="widget_style_custom_element"
                                title={intl.formatMessage(messages.widgetStyleCustomElementTitle)}
                                value={formik.values.widget_style_custom_element}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isDisabled={formik.isSubmitting}
                                isRequired={false}
                                defaultExpandMultilineText={false}
                                placeholder={JSON.stringify(customElementStyles, null, 2)}
                            />

                        </Spacings.Stack>
                    </Constraints.Horizontal>
                </CollapsiblePanel>

            </form>
        </>
    );
};

TextField.propTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
};

TextField.defaultProps = {
    type: 'text',
    value: '',
    placeholder: '',
};

WidgetConfigurationForm.displayName = 'WidgetConfigurationForm';

export default WidgetConfigurationForm;
