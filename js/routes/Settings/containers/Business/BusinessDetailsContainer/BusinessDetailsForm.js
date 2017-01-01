import React, { PropTypes as T } from 'react';

import { compose } from 'redux';

import { withApollo } from 'react-apollo';

import { reduxForm, Field, propTypes as reduxFormPropTypes, SubmissionError } from 'redux-form/immutable';

import isEmpty from 'isEmpty';

import { intlShape } from 'react-intl';

import messages from '../../../messages';

import style from '../../../Settings.scss';

import validations from './validations';

import BusinessNameField from '../../../components/BusinessNameField';
import BusinessDescriptionField from '../../../components/BusinessDescriptionField';
import OptionalTextInputField from '../../../components/OptionalTextInputField';

import MUTATION from './updateUserBusiness.mutation.graphql';

export class BusinessDetailsForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onKeyDown = this._onKeyDown.bind(this);
    this.onSubmit  = this.onSubmit.bind(this);
  }
  _onKeyDown(e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      const submit = this.props.handleSubmit(this.onSubmit);
      submit();
    }
  }

  async onSubmit(data) {
    const { intl, user } = this.props;

    const { data: { updateUserBusiness: { errors } } } = await this.props.client.mutate({
      mutation: MUTATION,
      variables: {
        userId  : user.get('id'),
        payload : {
          displayName   : data.get('displayName'),
          description   : data.get('description'),
          addressLine1  : data.get('addressLine1'),
          addressLine2  : data.get('addressLine2'),
          city          : data.get('city'),
          stateProvince : data.get('stateProvince'),
          postalCode    : data.get('postalCode'),
          phone         : data.get('phone'),
          taxId         : data.get('taxId'),

        } },
    });

    if (!isEmpty(errors)) {
      throw new SubmissionError(errors);
    }

    const { snackbar } = this.context;
    if (snackbar) {
      snackbar.notify({
        message: intl.formatMessage(messages.businessUpdateSuccessNotification),
      });
    }
  }

  render() {
    const { intl, handleSubmit, pristine, submitting, invalid } = this.props;
    return (
      <div className={style.content}>
        <h1 className={style.formHeading}>{intl.formatMessage(messages.linkBusinessDetails)}</h1>
        <div className={style.form}>
          <Field
            name='displayName'
            component={BusinessNameField}
            label={intl.formatMessage(messages.labelBusinessName)}
            onKeyDown={this.onKeyDown} />
          <Field
            name='description'
            component={BusinessDescriptionField}
            label={intl.formatMessage(messages.labelBusinessDescription)} />
          <Field
            name='addressLine1'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelAddressLine1)}
            onKeyDown={this.onKeyDown} />
          <Field
            name='addressLine2'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelAddressLine2)}
            onKeyDown={this.onKeyDown} />
          <Field
            name='city'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelCity)}
            onKeyDown={this.onKeyDown} />
          <Field
            name='stateProvince'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelStateProvince)}
            onKeyDown={this.onKeyDown}
            className={style.width15Percent} />
          <Field
            name='postalCode'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelPostalCode)}
            onKeyDown={this.onKeyDown}
            className={style.width15Percent} />
          <Field
            name='phone'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelPhone)}
            onKeyDown={this.onKeyDown} />
          <Field
            name='taxId'
            component={OptionalTextInputField}
            label={intl.formatMessage(messages.labelTaxId)}
            onKeyDown={this.onKeyDown} />
          <button onClick={handleSubmit(this.onSubmit)} disabled={pristine || submitting || invalid} className={style.saveButton}>
            {intl.formatMessage(messages.save)}
          </button>
        </div>
      </div>
    );

  }
}

BusinessDetailsForm.contextTypes = {
  snackbar: T.shape({
    notify: T.func.isRequired,
  }),
};

BusinessDetailsForm.defaultProps = {
};

BusinessDetailsForm.propTypes = {
  ...reduxFormPropTypes,
  intl: intlShape.isRequired,
  user: T.shape({
    id: T.string.isRequired,
  }).isRequired,
  initialValues: T.object.isRequired,
};

const Form = reduxForm({
  form: 'business.details',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  ...validations,
});

export default compose(
  withApollo,
  Form,
)(BusinessDetailsForm);
