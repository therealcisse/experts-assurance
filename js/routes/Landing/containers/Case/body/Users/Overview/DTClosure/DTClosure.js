import React from 'react';

import {compose, bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import Loading from '../Loading';

import { injectIntl } from 'react-intl';

import style from 'routes/Landing/styles';

import selector from './selector';

const LABEL = 'DT Clôture';

class DTClosure extends React.Component {
  render() {
    const { intl, docLoading, doc } = this.props;

    if (docLoading) {
      return (
        <Loading width={LABEL.length}/>
      );
    }

    if (!doc.closure) {
      return null;
    }

    return (
      <div className={style.overviewLine}>
        <div className={style.overviewLabel}>{LABEL}</div>
        <div className={style.overviewValue}>
          {intl.formatDate(doc.closure.date)}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return selector(state, props);
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators({}, dispatch)};
}

const Connect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  injectIntl,
  Connect,
)(DTClosure);

