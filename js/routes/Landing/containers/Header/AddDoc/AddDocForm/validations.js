import { generateValidation } from 'validation';

import { client as apolloClient } from 'apollo';

import GET_MATCHING_USERS_QUERY from './getMatchingUsers.query.graphql';

const validations = {
  dateMission: {
    required : true,
    date     : true,
    validateOnBlur : true,
  },

  date: {
    required : true,
    date     : true,
    validateOnBlur : true,
  },

  vehicleManufacturer : {
    required : true,
    validateOnBlur : true,
  },

  vehicleModel : {
    required : true,
    validateOnBlur : true,
  },

  vehiclePlateNumber : {
    required : true,
    validateOnBlur : true,
  },

  company : {
    required : true,
    validateOnBlur : true,
  },

  client : {
    promise : async (fielName, value, allValues) => {
      const {
        clientKey : key,
        clientDisplayName : displayName,
        clientEmail : email,
      } = allValues;

      if (!key && (displayName || email)) {
        // Are there matching clients
        const { data: { users } } = await apolloClient.query({
          query : GET_MATCHING_USERS_QUERY,
          variables : {
            type: 'CLIENT',
            displayName,
            email,
          },
        });

        if (users.length !== 0) {
          throw true;
        }
      }

      return false;
    },
  },
  clientDisplayName : {
    required : true,
    validateOnBlur : true,
  },
  clientEmail : {
    // required : true,
    email    : true,
    validateOnBlur : true,
  },

  agent : {
    promise : async (fielName, value, allValues) => {
      const {
        agentKey : key,
        agentDisplayName : displayName,
        agentEmail : email,
      } = allValues;

      if (!key && (displayName || email)) {
        // Are there matching agents
        const { data: { users } } = await apolloClient.query({
          query : GET_MATCHING_USERS_QUERY,
          variables : {
            type: 'AGENT',
            displayName,
            email,
          },
        });

        if (users.length !== 0) {
          throw true;
        }
      }

      return false;
    },
  },
  agentDisplayName : {
    required : true,
    validateOnBlur : true,
  },
  agentEmail : {
    // required : true,
    email    : true,
    validateOnBlur : true,
  },
};

export default generateValidation(validations);

