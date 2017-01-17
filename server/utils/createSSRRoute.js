import config from 'build/config';
import webpackConfig from 'build/webpack.config';

import path from 'path';

import createStore from 'server/store';
import getRoutes from 'server/routes';

import cookie from 'react-cookie';

import {StringDecoder} from 'string_decoder';

import { match } from 'react-router';

import createRenderEngine from './createRenderEngine';

import loading from './LoadingAnimation';

const log = require('log')('app:backend:ssr');

const decoder = new StringDecoder('utf8');

export default function createSSRRoute(app, compiler) {
  const renderEngine = createRenderEngine(app);

  const headRegExp = /(<\/head>)/i;
  const mainRegExp = /(<\/main>)/i;

  const indexHtml = new Promise((resolve, reject) => {
    if (config.env === 'development') {
      compiler.plugin('done', function () {
        // Webpack is done compiling
        compiler.outputFileSystem.readFile(path.resolve(webpackConfig.output.path, 'index.html'), 'utf8', function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(decoder.write(data));
          }
        });
      });
    } else {
      require('fs').readFile(config.utils_paths.dist('index.html'), 'utf8', function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  });

  return async function routeSSR(req, res, next) {
    cookie.plugToRequest(req, res);
    const index = await indexHtml;

    const store = createStore();
    match({ routes: getRoutes(store), location: req.originalUrl }, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send();
      } else if (redirectLocation) {
        res.status(302).redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        res.write(loading);
        renderEngine({
          renderProps,
          req,
          res,
          store,
        }).then(function ({ html, appState, apolloState }) {
          const head = [
            `<script>window.__APOLLO_STATE__=${apolloState};</script>`,
            `<script>window.__APP_STATE__=${appState};</script>`,
          ];

          let body = index;

          body = body.replace(headRegExp, function (match) {
            return head.join('') + match;
          });

          body = body.replace(mainRegExp, function (match) {
            return html + match;
          });

          res.status(200).end(body);
        }, function (error2) {
          log.error('failed to load', error2);
          res.status(500).send();
        });
      } else {
        res.status(404).send();
      }
    });
  };
}
