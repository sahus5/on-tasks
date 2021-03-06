// Copyright 2015, EMC, Inc.

'use strict';

module.exports = {
    friendlyName: 'Analyze OS Repository',
    injectableName: 'Task.Base.Os.Analyze.Repo',
    runJob: 'Job.Os.Analyze.Repo',
    requiredOptions: [
        'osName',
        'repo',
        'version'
    ],
    requiredProperties: {
    },
    properties: {
    }
};
