"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euglena_template = require("@euglena/template");
const euglena = require("@euglena/core");
const path = require("path");
const git = require("simple-git");
class Organelle extends euglena.alive.Organelle {
    constructor() {
        super(Organelle.NAME);
    }
    bindActions(addAction) {
        addAction(particles.incoming.Sap.NAME, (particle, callback) => {
            this.sapContent = particle.data;
            this.getAlive(particle);
        });
        addAction(particles.incoming.AddAndCommit.NAME, (particle, callback) => {
            this.git.add(particle.data.filePath).
                commit(particle.data.commitMessage, (err, data) => {
                if (err) {
                    this.send(new euglena_template.alive.particle.Exception({ innerException: null, message: JSON.stringify(err) }, this.sapContent.euglenaName));
                }
                else {
                    let call = callback || this.send;
                    call(new particles.outgoing.ASyncEnd(this.sapContent.euglenaName, (data.summary.changes + data.summary.insertions + data.summary.deletions) > 0));
                }
            });
        });
        addAction(particles.incoming.Push.NAME, (particle, callback) => {
            this.git.push('origin', 'master', {}, (err, data) => {
                if (err) {
                    this.send(new euglena_template.alive.particle.Exception({ innerException: null, message: JSON.stringify(err) }, this.sapContent.euglenaName));
                }
                else {
                    let call = callback || this.send;
                    call(new particles.outgoing.ASyncEnd(this.sapContent.euglenaName));
                }
            });
        });
    }
    getAlive(particle) {
        this.git = git(path.resolve(__dirname, particle.data.repositoryDirectory));
        /**
         * send a notification to the Cytoplasm
         * to inform about the organelle has been ready to get requests
         * */
        this.send(new euglena_template.alive.particle.OrganelleHasComeToLife(this.name, this.sapContent.euglenaName));
    }
}
Organelle.NAME = "euglena.organelle.git";
exports.Organelle = Organelle;
var particles;
(function (particles) {
    let incoming;
    (function (incoming) {
        class Sap extends euglena.ParticleV2 {
            /**
             *  TODO:
             * Add fields needed from outside
             * before started the organelle working
             */
            constructor(of, data) {
                super(new euglena.MetaV2(Sap.NAME, of), data);
            }
        }
        Sap.NAME = Organelle.NAME + ".sap";
        incoming.Sap = Sap;
        class AddAndCommit extends euglena.ParticleV2 {
            constructor(content, of) {
                super(new euglena.MetaV2(AddAndCommit.NAME, of), content);
            }
        }
        AddAndCommit.NAME = "AddAndCommit";
        incoming.AddAndCommit = AddAndCommit;
        class Push extends euglena.ParticleV2 {
            constructor(of) {
                super(new euglena.MetaV2(AddAndCommit.NAME, of));
            }
        }
        Push.NAME = "Push";
        incoming.Push = Push;
    })(incoming = particles.incoming || (particles.incoming = {}));
    let outgoing;
    (function (outgoing) {
        class ASyncEnd extends euglena.ParticleV2 {
            constructor(of, data) {
                super(new euglena.MetaV2(ASyncEnd.NAME, of), data);
            }
        }
        ASyncEnd.NAME = "ASyncEnd";
        outgoing.ASyncEnd = ASyncEnd;
    })(outgoing = particles.outgoing || (particles.outgoing = {}));
})(particles = exports.particles || (exports.particles = {}));

//# sourceMappingURL=index.js.map
