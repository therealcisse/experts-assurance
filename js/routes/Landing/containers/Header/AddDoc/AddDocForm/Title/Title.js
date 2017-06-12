import React from 'react'
import { compose } from 'redux';
import { connect } from 'react-redux';

import { createSelector } from 'utils/reselect';

import DataLoader from 'routes/Landing/DataLoader';

import printDocRef from 'printDocRef';

import style from 'routes/Landing/styles';

import { getFormValues } from 'redux-form/immutable';

class Title extends React.Component {
  render() {
    const { loading, dateMission, lastRefNo } = this.props;
    return (
      <div className={style.addDocFormTitleWrapper}>
        <div className={style.addDocFormTitle}>
          <h6>Ajouter dossier <b>{loading ? null : printDocRef({ refNo: lastRefNo + 1, dateMission })}</b>
          </h6>
          <h4>Entrer les informations nécessaires pour pouvoir enregistrer le dossier.
          </h4>
        </div>
      </div>
    )
  }
}

const dateMissionSelector = state => {
  const values = getFormValues('addDoc')(state);
  return values && values.has('dateMission') ? values.get('dateMission') : Date.now();
};

const selector = createSelector(
  dateMissionSelector,
  (dateMission) => ({ dateMission }),
);

function mapStateToProps(state, props) {
  return selector(state, props);
}

const Connect = connect(mapStateToProps);

export default compose(
  Connect,
  DataLoader.lastRefNo,
)(Title);

