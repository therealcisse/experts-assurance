import React, { PropTypes as T } from 'react';
import Recaptcha from 'react-recaptcha';
import nullthrows from 'nullthrows';
import loadScript from 'loadScript';
const log = require('log')('app:client:recaptcha');

import { RECAPCHA_JS_URL, RECAPCHA_SITE_KEY  } from 'vars';

export default class ReCAPTCHA extends React.Component {
  static propTypes = {
    input: T.shape({
      onChange: T.func.isRequired,
    }).isRequired,
  };
  state = {
    loaded: typeof grecaptcha !== 'undefined',
  };
  constructor(props) {
    super(props);

    this.onLoadCallback = this.onLoadCallback.bind(this);
    this.onVerify       = this.onChange.bind(this, true);
    this.onExpired      = this.onChange.bind(this, false);
  }
  async componentWillMount() {
    if (!this.state.loaded) {
      try {
        await loadScript(nullthrows(RECAPCHA_JS_URL));
        this.setState({
          loaded: true,
        });

      } catch (e) {
        log.error('Error loading recaptcha', e);
      }
    }
  }
  onLoadCallback() {
  }
  onChange(value) {
    this.props.input.onChange(value);
  }
  render() {
    if (this.state.loaded) {
      return (
        <Recaptcha
          sitekey={nullthrows(RECAPCHA_SITE_KEY)}
          render={'explicit'}
          verifyCallback={this.onVerify}
          onloadCallback={this.onLoadCallback}
          expiredCallback={this.onExpired}
        />
      );
    }
    return null;
  }
}

