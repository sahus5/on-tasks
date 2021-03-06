// Copyright 2015, EMC, Inc.
/* jshint node:true */

'use strict';

var uuid = require('node-uuid');

describe(require('path').basename(__filename), function () {
    var base = require('./base-spec');
    var VboxObmService;
    var waterline;

    base.before(function (context) {
        // create a child injector with on-core and the base pieces we need to test this
        helper.setupInjector([
            helper.require('/lib/services/base-obm-service.js'),
            helper.require('/lib/services/vbox-obm-service.js'),
            helper.require('/lib/services/obm-service.js'),
            helper.require('/lib/jobs/base-job.js'),
            helper.require('/lib/jobs/create-obm-settings.js')
        ]);

        context.Jobclass = helper.injector.get('Job.Obm.CreateSettings');
        VboxObmService = helper.injector.get('vbox-obm-service');
        waterline = helper.injector.get('Services.Waterline');

        waterline.nodes = {
            updateByIdentifier: sinon.stub().resolves()
        };
    });

    describe('Base', function () {
        base.examples();
    });

    describe('create-obm-settings job', function() {
        beforeEach('create-obm-settings-job beforeEach', function() {
            this.sandbox = sinon.sandbox.create();
            var jobOptions = {
                service: 'vbox-obm-service',
                config: {
                    'alias': 'test',
                    'user': 'test'
                }
            };
            this.job = new this.Jobclass(
                jobOptions, { target: '554c0de769bb1ea853cf9db1' }, uuid.v4());
        });

        afterEach('create-obm-settings-job afterEach', function() {
            this.sandbox.restore();
        });

        it('should update node with OBM settings', function() {
            var self = this;
            self.sandbox.stub(self.job, '_done');
            self.sandbox.stub(self.job, 'liveTestObmConfig').resolves();

            var expectedUpdateData = {
                obmSettings: [ self.job.obmSettings ]
            };

            return self.job._run()
            .then(function() {
                expect(waterline.nodes.updateByIdentifier)
                    .to.have.been.calledWith(self.job.nodeId, expectedUpdateData);
            });
        });

        it('should run <obmService>.powerStatus in liveTestObmConfig()', function() {
            var self = this;
            var powerStatus = self.sandbox.stub(VboxObmService.prototype, 'powerStatus');
            powerStatus.resolves();
            return self.job.liveTestObmConfig()
            .then(function() {
                expect(powerStatus).to.have.been.calledOnce;
            });
        });
    });
});
