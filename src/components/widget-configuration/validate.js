import TextInput from '@commercetools-uikit/text-input';

const validate = (values) => {
  const errors = {};

  if (TextInput.isEmpty(values.payment_methods_cards_title)) {
    errors.payment_methods_cards_title = {missing: true};
  }

  if (TextInput.isEmpty(values.payment_methods_bank_accounts_title)) {
    errors.payment_methods_bank_accounts_title = {missing: true};
  }

  if (TextInput.isEmpty(values.payment_methods_wallets_title)) {
    errors.payment_methods_wallets_title = {missing: true};
  }

  if (TextInput.isEmpty(values.payment_methods_alternative_payment_method_title)) {
    errors.payment_methods_alternative_payment_method_title = {missing: true};
  }

  return errors;
};

export default validate;