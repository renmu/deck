'use strict';

const angular = require('angular');
import _ from 'lodash';

module.exports = angular.module('spinnaker.netflix.pipeline.stage.property.details.controller', [
  require('angular-ui-router').default,
])
  .controller('PropertyExecutionDetailsCtrl', function ($scope, $stateParams, $state, executionDetailsSectionService) {

    $scope.configSections = ['propertiesConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
      $scope.properties = getPropertiesForAction($scope.stage.context);
      $scope.originalProperties = extractProperties($scope.stage.context.originalProperties);
      $scope.rolledBack = $scope.stage.context.rollbackProperties;
      $scope.notificationEmail = $scope.stage.context.email;
      $scope.cmcTicket = $scope.stage.context.cmcTicket;
      $scope.scope = $scope.stage.context.scope;
      $scope.propertyAction = $scope.stage.context.propertyAction;
      $scope.pipelineStatus = $scope.execution.status;
    };

    this.getSrefTarget = () => {
      const currentState = $state.current.name;
      if (currentState.includes('.properties.')) {
        return '.execution';
      }
      if (currentState.includes('.rollouts.')) {
        return '.rollouts.execution';
      }
      return '^.^.propInsights.properties';
    };

    this.propertyScopeForDisplay = () => {
      let temp = _.omit($scope.scope, ['appIdList', 'instanceCounts']);
      return Object.assign(temp, {'app': _.head($scope.scope.appIdList) });
    };

    this.getErrorMessage = () => {
      return $scope.stage.context.exception.details.error;
    };

    this.isExecutionTerminalOrCanceled = () => {
      return $scope.pipelineStatus === 'TERMINAL' || $scope.pipelineStatus === 'CANCELED';
    };

    this.wasCreateAction = () => {
      return $scope.propertyAction === 'CREATE';
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

    let getPropertiesForAction = (stageContext) => {
      if (stageContext.propertyAction === 'DELETE' && stageContext.originalProperties) {
        return extractProperties(stageContext.originalProperties);
      }
      return stageContext.persistedProperties;
    };

    const extractProperties = (propertyList) => propertyList ? propertyList.map(prop => prop.property) : [];

  });
