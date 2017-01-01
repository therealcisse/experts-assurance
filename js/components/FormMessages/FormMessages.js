import React, { PropTypes as T } from 'react';
import {connect} from 'react-redux';

import { fromJS } from 'immutable';

class FormMessages extends React.Component {
  constructor(props, context) {
    super(props, context);
    if (!context._reduxForm) {
      throw new Error('FormMessages must be inside a component decorated with reduxForm()');
    }
  }
  renderChildren(children, field, errorCount) {
    if (field && field.touched && field.errors) {
      const errorList = React.Children.toArray(children)
        .filter(function (child) {
          return child.props.when && field.errors.get(child.props.when);
        });

      const displayErrorCount = parseInt(errorCount, 10);
      if (displayErrorCount < 0) {
        return errorList;
      }
      return errorList.slice(0, displayErrorCount);
    }
  }

  render() {
    const { children, getFieldMeta, errorCount, ...rest } = this.props;
    const { _reduxForm: { form, getFormState } } = this.context;
    return (
      <this.props.tagName {...rest}>
        {this.renderChildren(children, /* field = */ getFieldMeta(form, getFormState), errorCount)}
      </this.props.tagName>
    );
  }
}

FormMessages.propTypes = {
  field      : T.string.isRequired,
  tagName    : T.oneOfType([T.element, T.string]),
  errorCount : T.oneOfType([T.number, T.string]),
};

FormMessages.defaultProps = {
  errorCount : -1,
  tagName    : 'div',
};

FormMessages.contextTypes = {
  _reduxForm: T.object,
};

function mapStateToProps(state, { field }) {
  return {
    getFieldMeta: (form, getFormState) => {
      const formState = getFormState(state);
      return {
        name    : field,
        touched : getIn(formState, ['fields', field, 'touched'], false),
        errors  : merge(
          getIn(formState, ['asyncErrors', field]),
          getIn(formState, ['submitErrors', field]),
        ),
      };
    },
  };
}

const getIn = (obj, prop, notSetValue) => {
  return obj.getIn(prop, notSetValue);
};

const merge = (...args) => args.reduce((memo, arg) => arg ? memo.mergeDeep(arg) : memo, fromJS({}));

export default connect(mapStateToProps)(
  FormMessages
);
