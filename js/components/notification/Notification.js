import React, {} from 'react';
import {bindActionCreators} from 'redux';

import {connect} from 'react-redux';

import cx from 'classnames';

import selector from './selector';

import style from './Notification.scss';

import SessionExpired from './SessionExpired';
import BusinessRequired from './BusinessRequired';
import InvalidLink from './InvalidLink';
import PasswordResetSuccess from './PasswordResetSuccess';
import VerificationPending from './VerificationPending';
import VerificationSuccess from './VerificationSuccess';

import { remove } from 'redux/reducers/notification/actions';

class Notification extends React.Component {
  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);
  }


  /**
   * Component update optimization.
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {

    // ### id
    // Check if a new id has been requested.

    const curId = this.props.notification.id;
    const nxtId = nextProps.notification.id;

    if (nxtId !== curId) {
      return true;
    }

    // ### Animation
    // Check if a new animation sequence has been requested.

    const curAnim = this.props.notification.animation;
    const nxtAnim = nextProps.notification.animation;

    if (nxtAnim !== curAnim) {
      return true;
    }

    // ### Active
    // Check if active has changed.

    const curActive = this.props.notification.options.active;
    const nxtActive = nextProps.notification.options.active;

    if (nxtActive !== curActive) {
      return true;
    }

    return false;
  }

  /**
   * Remove the relay subscription when the component unmounts.
   * @return {Void}
   */
  componentWillUnmount() {
  }

  /**
   * Returns the current class names for the notification.
   * @return {String}
   */
  getClass() {
    const { notification: { animation } } = this.props;
    return cx({
      [style.notification] : true,
      [style.animated]     : !!animation,
      [style[animation]]   : !!animation,
    });
  }

  onClose() {
    this.props.actions.remove();
  }

  /**
   * Renders the notification components.
   * @return {Object}
   */
  render() {
    const { id, options: { active } } = this.props.notification;
    if (active) {
      switch (id) {
        case 'SessionExpired':
          return <SessionExpired className={this.getClass()}/>;
        case 'BusinessRequired':
          return <BusinessRequired className={this.getClass()}/>;
        case 'InvalidLink':
          return <InvalidLink className={this.getClass()} onClose={this.onClose}/>;
        case 'PasswordResetSuccess':
          return <PasswordResetSuccess className={this.getClass()}/>;
        case 'VerificationPending':
          return <VerificationPending className={this.getClass()}/>;
        case 'VerificationSuccess':
          return <VerificationSuccess className={this.getClass()} onClose={this.onClose}/>;
        default:
          return null;
      }
    }
    return null;
  }

}

function mapStateToProps(state, props) {
  return selector(state, props);
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators({ remove }, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(
  Notification
);
