import parseGraphqlScalarFields from '../parseGraphqlScalarFields';
import parseGraphqlObjectFields from '../parseGraphqlObjectFields';

import { Role_ADMINISTRATORS, Role_MANAGERS, userHasRoleAll, userHasRoleAny, userVerified } from 'roles';

import * as codes from 'result-codes';

import config from 'build/config';

import { pubsub } from '../subscriptions';

import graphqlFields from 'graphql-fields';

import getDocValidations from './docValidations';

import payValidations from 'routes/Landing/containers/Case/body/Users/Overview/Payment/PaymentSetter/PaymentForm/validations';
import closureValidations from 'routes/Landing/containers/Case/body/Users/Overview/CloseDoc/CloseDocForm/validations';

import { fromJS } from 'immutable';

const log = require('log')('app:backend:docs');

export const schema = [`

  type Observation {
    id: ID!
    text: String!
    user: User!
    document: Doc!
    date: Date!
  }

  type DocObservationsResponse {
    items: [Observation!]!
    prevCursor: Date
    cursor: Date
  }

  input DocPaymentInfo {
    date   : Date
    amount : Float
  }

  input DocClosureInfo {
    dateClosure   : Date
    paymentDate   : Date
    paymentAmount : Float
  }

  type UploadFileResponse {
    doc: Doc
    file: File
    activities : [Activity!]!
    error: Error
  }

  type DelOrRestoreFileResponse {
    doc: Doc
    file: File
    activities : [Activity!]!
    error: Error
  }

  input FileInput {
    name: String!
    type: String!
    size: Int!
    path: String!
  }

  type File {
    id: ID!
    name: String!
    category: String!
    type: String!
    size: Int!
    url: String!
    date: Date!
    user: User!
    deletion: Deletion
  }

  type RefNo {
    value: Int!
  }

  # Mutations

  enum UserInKey {
    id
    userData
  }

  input AddDocPayload {
    vehicleManufacturer : String
    vehicleModel : String
    vehiclePlateNumber : String
    vehicleSeries : String
    vehicleMileage : String
    vehicleDMC : String
    vehicleEnergy : String
    vehiclePower : String

    clientKey : UserInKey
    clientId : String
    clientDisplayName : String
    clientEmail : String

    agentKey : UserInKey
    agentId : String
    agentDisplayName : String
    agentEmail : String

    dateMission: Date
    date: Date

    company: String

    # isOpen: Boolean!
  }

  type AddDocResponse {
    doc: Doc
    activities : [Activity!]!
    errors: JSON!
    error: Error
  }

  type DelOrRestoreDocResponse {
    error: Error
    doc: Doc
    activities : [Activity!]!
  }

  type SetOrDelPayResponse {
    error: Error
    doc: Doc
    activities : [Activity!]!
  }

  type SetManagerResponse {
    doc: Doc
    manager: User
    activities : [Activity!]!
    error: Error
  }

  type SetStateResponse {
    doc: Doc
    activities : [Activity!]!
    error: Error
  }

  # Dashboard

  type PendingShape {
    count: Int!
  }
  type OpenShape {
    count: Int!
  }
  type ClosedShape {
    count: Int!
  }
  type CanceledShape {
    count: Int!
  }

  type Dashboard {
    pending: PendingShape!
    open: OpenShape!
    closed: ClosedShape!
    canceled: CanceledShape!
  }

  # Sort
  enum DocsSortKey {
    refNo
    date
  }

  input DocsSortConfig {
    key: DocsSortKey
    direction: SortDirection
  }

  # Queries

  type ESDocValidationState {
    date: Date!
    user: ESUserSource!
  }

  type ESDocClosureState {
    date: Date!
    user: ESUserSource!
    state: DocState!
  }

  type ESDocSource {
    id: ID!
    company: String

    refNo: String!

    state: DocState!
    dateMission: Date!

    paymentInfo: Payment

    vehicle: Vehicle!

    manager: ESUserSource
    client: ESUserSource!
    agent: ESUserSource!
    user: ESUserSource!

    validation: ESDocValidationState
    closure: ESDocClosureState

    date: Date!
    lastModified: Date!
  }

  type ESDoc {
    _index: String!
    _type: String!
    _id: String!
    _score: Int!
    highlight: [String!]!
    _source: ESDocSource!
  }

  input UserQuery {
    id: ID
    q: String
  }

  input DateRange {
    from: Date
    to: Date
  }

  input ESSortConfig {
    key: String
    direction: SortDirection
  }

  input ESDocsQueryPayload {
    q: String
    state: DocState

    manager: UserQuery
    client: UserQuery
    agent: UserQuery

    vehicleManufacturer: String
    vehicleModel: String

    range: DateRange
    # validationRange: DateRange
    closureRange: DateRange

    validator: UserQuery
    closer: UserQuery
    user: UserQuery

    lastModified: Date

    sortConfig: ESSortConfig

    cursor: Int
  }

  type ESDocsQueryResponse {
    took: Int!
    length: Int!
    max_score: Float
    cursor: Int!
    hits: [ESDoc!]!
  }

  type DocsFetchResponse {
    cursor: Int!
    length: Int!
    docs: [Doc!]!
  }

  input DocsFetchQuery {
    queryString: String
    sortConfig: DocsSortConfig!
    state: DocState
    client: ID
    manager: ID
    agent: ID
    cursor: Int
  }

  # ------------------------------------
  # DocState type
  # ------------------------------------
  enum DocState {
    # PENDING
    OPEN
    CLOSED
    CANCELED
  }

  # ------------------------------------
  # Payment type
  # ------------------------------------
  type Payment {
    date: Date!
    user: User!
    amount: Float!
    meta: JSON!
  }

  # ------------------------------------
  # Vehicle type
  # ------------------------------------
  type Vehicle {
    manufacturer: String
    model: String! # Type
    plateNumber: ID!
    series: String
    mileage: String
    DMC: String
    energy: String
    power: String
  }

  # ------------------------------------
  # Validation type
  # ------------------------------------
  type DocValidationState {
    date: Date!
    user: User!
  }

  # ------------------------------------
  # Closure type
  # ------------------------------------
  type DocClosureState {
    date: Date!
    user: User!
    state: DocState!
  }

  # ------------------------------------
  # Doc type
  # ------------------------------------
  type Doc {
    id: ID!

    company: String

    key: ID!

    refNo: String!

    date: Date!
    dateMission: Date!

    state: DocState!

    paymentInfo: Payment

    vehicle: Vehicle!

    client: User!
    manager: User
    agent: User!
    user: User!

    validation: DocValidationState
    closure: DocClosureState

    createdAt: Date!
    updatedAt: Date!

    lastModified: Date!

    deletion: Deletion

    business: Business
  }

`];

export const resolvers = {

  Vehicle: Object.assign(
    {
    },
    parseGraphqlObjectFields([
    ]),
    parseGraphqlScalarFields([
      'manufacturer',
      'model',
      'plateNumber',
      'series',
      'mileage',
      'DMC',
      'energy',
      'power',
    ])
  ),

  File: Object.assign(
    {
    },
    {
      deletion: (file) => {
        const deletion_date  = file.get('deletion_date');
        const deletion_user  = file.get('deletion_user');

        if (deletion_date && deletion_user) {
          return {
            date  : deletion_date,
            user  : deletion_user,
          };
        }

        return null;
      },
      url: (file) => {
        if (file.has('fileObj')) {
          try {
            return file.get('fileObj').url({ forceSecure : config.secure });
          } catch (e) {
            log.error('File.url threw error', e);
          }
        }

        return null;
      },
    },
    parseGraphqlObjectFields([
      'user',
    ]),
    parseGraphqlScalarFields([
      'name',
      'category',
      'type',
      'size',
      'date',
    ])
  ),

  Observation: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'user',
      'document',
    ]),
    parseGraphqlScalarFields([
      'id',
      'text',
      'date',
    ])
  ),

  Doc: Object.assign(
    {
    },
    {
      validation: (doc) => {
        const validation_date = doc.validation_date || doc.get('validation_date');
        const validation_user = doc.validation_user || doc.get('validation_user');

        if (validation_date && validation_user) {
          return {
            date : validation_date,
            user : validation_user,
          };
        }

        return null;
      },
      paymentInfo: (doc) => {
        const payment_date   = doc.payment_date   || doc.get('payment_date');
        const payment_amount = doc.payment_amount || doc.get('payment_amount');
        const payment_user   = doc.payment_user   || doc.get('payment_user');
        const payment_meta   = doc.payment_meta   || doc.get('payment_meta');

        if (payment_date && payment_amount && payment_user) {
          return {
            date   : payment_date,
            amount : payment_amount,
            user   : payment_user,
            meta   : payment_meta || {},
          };
        }

        return null;
      },
      closure: (doc) => {
        const closure_date  = doc.closure_date  || doc.get('closure_date');
        const closure_state = doc.closure_state || doc.get('closure_state');
        const closure_user  = doc.closure_user  || doc.get('closure_user');

        if (closure_date && closure_state && closure_user) {
          return {
            date  : closure_date,
            state : closure_state,
            user  : closure_user,
          };
        }

        return null;
      },
      deletion: (doc) => {
        const deletion_date  = doc.deletion_date  || doc.get('deletion_date');
        const deletion_user  = doc.deletion_user  || doc.get('deletion_user');

        if (deletion_date && deletion_user) {
          return {
            date  : deletion_date,
            user  : deletion_user,
          };
        }

        return null;
      },
      lastModified(doc, {}, context) {
        let ret;

        if (!context.user) {
          ret = doc.get
            ? doc.get('lastModified')
            : doc.lastModified;
        } else {
          ret = doc.get
            ? doc.get(`lastModified_${context.user.id}`) || doc.get('lastModified') || doc.updatedAt
            : doc[`lastModified_${context.user.id}`] || doc.lastModified || doc.updatedAt;
        }

        return typeof ret !== 'undefined' ? ret :  null;
      },
    },
    parseGraphqlObjectFields([
      'business',

      'vehicle',

      'client',
      'manager',
      'agent',
      'user',
    ]),
    parseGraphqlScalarFields([
      'id',
      'company',
      'refNo',
      'key',
      'date',
      'dateMission',
      'state',
      'createdAt',
      'updatedAt',
    ])
  ),

  ESDocSource: Object.assign(
    {
    },
    {
      validation: (doc) => {
        const validation_date = doc.validation_date;
        const validation_user = doc.validation_user;

        if (validation_date && validation_user) {
          return {
            date : validation_date,
            user : validation_user,
          }
        }
        return null;
      },
      paymentInfo: (doc) => {
        const payment_date   = doc.payment_date;
        const payment_amount = doc.payment_amount;
        const payment_user   = doc.payment_user;
        const payment_meta   = doc.payment_meta;

        if (payment_date && payment_amount && payment_user) {
          return {
            date   : payment_date,
            amount : payment_amount,
            user   : payment_user,
            meta   : payment_meta || {},
          };
        }

        return null;
      },
      closure: (doc) => {
        const closure_date  = doc.closure_date;
        const closure_state = doc.closure_state;
        const closure_user  = doc.closure_user;

        if (closure_date && closure_state && closure_user) {
          return {
            date  : closure_date,
            state : closure_state,
            user  : closure_user,
          };
        }

        return null;
      },
      lastModified(doc, {}, context) {
        let ret;

        if (!context.user) {
          ret = doc.lastModified;
        } else {
          ret = doc[`lastModified_${context.user.id}`] || doc.lastModified;
        }

        return typeof ret !== 'undefined' ? ret :  null;
      },
    },
  ),

  ESDoc: Object.assign(
    {
      highlight(_source, {}, {}) {
        return Object.keys(_source.highlight || {});
      },
    },
  ),

  AddDocResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'errors',
      'error',
    ])
  ),

  DelOrRestoreDocResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'error',
    ])
  ),

  SetOrDelPayResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'error',
    ])
  ),

  DocObservationsResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
    ]),
    parseGraphqlScalarFields([
      'items',
      'prevCursor',
      'cursor',
    ])
  ),

  UploadFileResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
      'file',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'error',
    ])
  ),

  DelOrRestoreFileResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
      'file',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'error',
    ])
  ),

  SetManagerResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
      'manager',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'error',
    ])
  ),

  SetStateResponse: Object.assign(
    {
    },
    parseGraphqlObjectFields([
      'doc',
    ]),
    parseGraphqlScalarFields([
      'activities',
      'error',
    ])
  ),

  Mutation: {
    async addDoc(_, { payload }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      try {
        const docValidations = getDocValidations(context);
        await docValidations.asyncValidate(fromJS({ ...payload }));
      } catch (errors) {
        return { errors };
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED }, errors: {} };
      }

      if (userHasRoleAny(context.user, Role_ADMINISTRATORS, Role_MANAGERS)) {

        function getUser({
          key,
          id,
          displayName,
          email,
        }) {

          if (key === 'id') {
            return { key, id };
          }

          if (key === 'userData') {
            return { key, userData : {displayName, email} };
          }

          throw new Error(`addDoc: Invalid user entry`);
        }

        const data = {
          dateMission : payload.dateMission,
          date        : payload.date,

          company     : payload.company,

          vehicle : {
            manufacturer  : payload.vehicleManufacturer,
            model         : payload.vehicleModel,
            plateNumber   : payload.vehiclePlateNumber,
            series        : payload.vehicleSeries,
            mileage       : payload.vehicleMileage,
            DMC           : payload.vehicleDMC,
            energy        : payload.vehicleEnergy,
            power         : payload.vehiclePower,
          },

          client : getUser({
            key         : payload.clientKey,
            id          : payload.clientId,
            displayName : payload.clientDisplayName,
            email       : payload.clientEmail,
          }),

          agent : getUser({
            key         : payload.agentKey,
            id          : payload.agentId,
            displayName : payload.agentDisplayName,
            email       : payload.agentEmail,
          }),

          // isOpen : payload.isOpen,
        };

        const { doc, activities } = await context.Docs.addDoc(data);
        // publish subscription notification
        pubsub.publish('addDocChannel', doc);
        return { doc, activities, errors: {} };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED }, errors: {} };
    },
    async delDoc(_, { id }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (!userHasRoleAll(context.user, Role_ADMINISTRATORS)) {
        return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
      }

      const { doc, activities } = await context.Docs.delDoc(id);
      // publish subscription notification
      pubsub.publish('delDocChannel', id);
      return { activities, doc };
    },
    async restoreDoc(_, { id }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (!userHasRoleAll(context.user, Role_ADMINISTRATORS)) {
        return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
      }

      const { doc, activities } = await context.Docs.restoreDoc(id);
      // publish subscription notification
      pubsub.publish('restoreDocChannel', id);
      return { activities, doc };
    },
    async setManager(_, { id, manager }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS)) {
        const { doc, manager: user, activities } = await context.Docs.setManager(id, manager);
        // publish subscription notification
        pubsub.publish('docChangeChannel', id);
        return { doc, manager : user, activities };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async setPay(_, { id, info }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      try {
        await payValidations.asyncValidate(fromJS({ ...info }));
      } catch (errors) {
        return { errors };
      }

      async function isDocManager(user, id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.has('manager') && (doc.get('manager').id === user.id);
        }
        return false;
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS) || await isDocManager(request.user, id)) {
        const { doc, activities } = await context.Docs.setPay(id, info);
        // publish subscription notification
        pubsub.publish('docChangeChannel', id);
        return { doc, activities };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async delPay(_, { id }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      async function isDocManager(user, id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.has('manager') && (doc.get('manager').id === user.id);
        }
        return false;
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS) || await isDocManager(request.user, id)) {
        const { doc, activities } = await context.Docs.delPay(id);
        // publish subscription notification
        pubsub.publish('docChangeChannel', id);
        return { doc, activities };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async setState(_, { id, state }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      async function isDocManager(user, id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.has('manager') && (doc.get('manager').id === user.id);
        }
        return false;
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS) || await isDocManager(request.user, id)) {
        const { doc, activities } = await context.Docs.setState(id, state);
        // publish subscription notification
        pubsub.publish('docChangeChannel', id);
        return { doc, activities };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async closeDoc(_, { id, info }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      try {
        await closureValidations.asyncValidate(fromJS({ ...info }));
      } catch (errors) {
        return { errors };
      }

      async function isDocManager(user, id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.has('manager') && (doc.get('manager').id === user.id);
        }
        return false;
      }

      async function isDocOpen(id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.get('state') === 'OPEN';
        }
        return false;
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS) || await isDocManager(request.user, id)) {
        if (!await isDocOpen(id)) {
          return { activities : [], error: { code: codes.ERROR_ILLEGAL_OPERATION } };
        }

        const { doc, activities } = await context.Docs.closeDoc(id, info);
        // publish subscription notification
        pubsub.publish('docChangeChannel', id);
        return { doc, activities };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async cancelDoc(_, { id }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      async function isDocManager(user, id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.has('manager') && (doc.get('manager').id === user.id);
        }
        return false;
      }

      async function isDocOpen(id) {
        const doc = await context.Docs.get(id);
        if (doc) {
          return doc.get('state') === 'OPEN';
        }
        return false;
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS) || await isDocManager(request.user, id)) {
        if (!await isDocOpen(id)) {
          return { activities : [], error: { code: codes.ERROR_ILLEGAL_OPERATION } };
        }

        const { doc, activities } = await context.Docs.cancelDoc(id);
        // publish subscription notification
        pubsub.publish('docChangeChannel', id);
        return { doc, activities };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async uploadFile(_, { docId, category, metadata }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      async function isManager() {
        const doc = await context.Docs.get(docId);
        if (doc) {
          return doc.has('manager') && (doc.get('manager').id === context.user.id);
        }
        return false;
      }

      if (userHasRoleAll(context.user, Role_ADMINISTRATORS)
        || (userHasRoleAll(context.user, Role_MANAGERS) && await isManager())) {

        const { file, activities } = await context.Docs.uploadFile({ docId, category, metadata });
        // publish subscription notification
        pubsub.publish('uploadFileChannel', file);
        return { file, activities, errors: {} };
      }

      return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
    },
    async delFile(_, { id }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      async function isManager() {
        const file = await context.Docs.getFile(id);
        if (file) {
          const doc = await context.Docs.get(file.get('document').id);
          if (doc) {
            return doc.has('manager') && (doc.get('manager').id === context.user.id);
          }
        }
        return false;
      }

      async function isValid() {
        const file = await context.Docs.getFile(id);
        if (file) {
          const doc = await context.Docs.get(file.get('document').id);
          if (doc) {
            return !doc.has('deletion_date') && (doc.get('state') === 'OPEN');
          }
        }
        return false;
      }

      if (!userHasRoleAll(context.user, Role_ADMINISTRATORS)
        && !(userHasRoleAll(context.user, Role_MANAGERS) && !await isValid() && !await isManager())) {
        return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
      }

      const { file, activities } = await context.Docs.delFile(id);
      // publish subscription notification
      pubsub.publish('delFileChannel', id);
      return { activities, file };
    },
    async restoreFile(_, { id }, context) {
      if (!context.user) {
        throw new Error('A user is required.');
      }

      if (!userVerified(context.user)) {
        return { activities : [], error: { code: codes.ERROR_ACCOUNT_NOT_VERIFIED } };
      }

      async function isManager() {
        const file = await context.Docs.getFile(id);
        if (file) {
          const doc = await context.Docs.get(file.get('document').id);
          if (doc) {
            return doc.has('manager') && (doc.get('manager').id === context.user.id);
          }
        }
        return false;
      }

      if (!userHasRoleAll(context.user, Role_ADMINISTRATORS)
        && !(userHasRoleAll(context.user, Role_MANAGERS) && !await isManager())) {
        return { activities : [], error: { code: codes.ERROR_NOT_AUTHORIZED } };
      }

      const { file, activities } = await context.Docs.restoreFile(id);
      // publish subscription notification
      pubsub.publish('restoreFileChannel', id);
      return { activities, file };
    },
  },

  Query: {
    getDoc(obj, { id }, context) {
      return context.Docs.get(id);
    },
      getFile(obj, { id }, context) {
        return context.Docs.getFile(id);
      },
      getDocs(obj, { query }, context, info) {
        const topLevelFields = Object.keys(graphqlFields(info));
        return context.Docs.getDocs(query, topLevelFields);
      },
      // usersByRoles(obj, { queryString, roles }, context) {
      //   return context.Docs.searchUsersByRoles(queryString, roles);
      // },

      esUsersByRoles(obj, { queryString, roles }, context) {
        return context.Docs.esSearchUsersByRoles(queryString, roles);
      },
      esSearchDocs(obj, { queryString, state }, context) {
        return context.Docs.esSearchDocs(queryString, state);
      },
      esQueryDocs(obj, { query }, context) {
        return context.Docs.esQueryDocs(query);
      },

      // pendingDashboard(_, { durationInDays, cursor = 0, sortConfig }, context, info) {
      //   const selectionSet = Object.keys(graphqlFields(info));
      //   return context.Docs.pendingDashboard(
      //     durationInDays,
      //     cursor,
      //     sortConfig,
      //     selectionSet,
      //     context.Now,
      //   );
      // },
      openDashboard(_, { durationInDays, cursor = 0, sortConfig, validOnly }, context, info) {
        const selectionSet = Object.keys(graphqlFields(info));
        return context.Docs.openDashboard(
          durationInDays,
          cursor,
          sortConfig,
          selectionSet,
          validOnly,
          context.Now,
        );
      },
      // closedDashboard(_, { durationInDays, cursor = 0, sortConfig, includeCanceled }, context, info) {
      //   const selectionSet = Object.keys(graphqlFields(info));
      //   return context.Docs.closedDashboard(
      //     durationInDays,
      //     cursor,
      //     sortConfig,
      //     selectionSet,
      //     includeCanceled,
      //     context.Now,
      //   );
      // },

      recentDocs(_, {}, context) {
        return context.Docs.recent();
      },

      dashboard(_, {}, context, info) {
        const selectionSet = Object.keys(graphqlFields(info));
        return context.Docs.dashboard(selectionSet);
      },

      getLastRefNo(_, { now }, context) {
        return context.Business.getLastRefNo(now);
      },

      getDocFiles(_, { id }, context) {
        return context.Docs.getDocFiles(id);
      },

      isDocValid(_, { id }, context) {
        return context.Docs.isDocValid(id);
      },
      getInvalidDocs(_, { category, durationInDays, cursor = 0, sortConfig }, context, info) {
        const selectionSet = Object.keys(graphqlFields(info));
        return context.Docs.getInvalidDocs({ category, durationInDays, cursor, sortConfig, selectionSet, now : context.Now });
      },
      getUnpaidDocs(_, { durationInDays, cursor = 0, sortConfig }, context, info) {
        const selectionSet = Object.keys(graphqlFields(info));
        return context.Docs.getUnpaidDocs({ durationInDays, cursor, sortConfig, selectionSet, now : context.Now });
      },

      getDocObservations(_, { id, cursor }, context) {
        return context.Docs.getDocObservations({ id, cursor });
      },

      searchVehicles(_, { queryString }, context) {
        return context.Docs.searchVehicles(queryString);
      },
      vehicleByPlateNumber(_, { plateNumber }, context) {
        return context.Docs.vehicleByPlateNumber(plateNumber);
      },

  },

};

