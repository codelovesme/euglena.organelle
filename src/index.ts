
"use strict";
import * as euglena_template from "@euglena/template";
import * as euglena from "@euglena/core";
import { sys, js } from "cessnalib";
import * as path from "path";

const git = require("simple-git");

import Particle = euglena.AnyParticle;

export class Organelle extends euglena.alive.Organelle<particles.incoming.SapContent> {
    public static readonly NAME = "euglena.organelle.git"
    private sapContent: particles.incoming.SapContent;
    git: any;
    constructor() {
        super(Organelle.NAME);
    }
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void {
        addAction(particles.incoming.Sap.NAME, (particle: particles.incoming.Sap, callback) => {
            this.sapContent = particle.data;
            this.getAlive(particle);
        });
        addAction(particles.incoming.AddAndCommit.NAME, (particle: particles.incoming.AddAndCommit, callback: (particle: Particle) => void) => {
            this.git.add(particle.data.filePath).
                commit(particle.data.commitMessage, (err: any, data: any) => {
                    if (err) {
                        this.send(new euglena_template.alive.particle.Exception({ innerException: null, message: JSON.stringify(err) }, this.sapContent.euglenaName));
                    } else {
                        let call = callback || this.send;
                        call(new particles.outgoing.ASyncEnd(this.sapContent.euglenaName, (data.summary.changes + data.summary.insertions + data.summary.deletions) > 0));
                    }
                });
        });
        addAction(particles.incoming.Push.NAME, (particle: particles.incoming.Push, callback: (particle: Particle) => void) => {
            this.git.push('origin', 'master', {}, (err: any, data: any) => {
                if (err) {
                    this.send(new euglena_template.alive.particle.Exception({ innerException: null, message: JSON.stringify(err) }, this.sapContent.euglenaName));
                } else {
                    let call = callback || this.send;
                    call(new particles.outgoing.ASyncEnd(this.sapContent.euglenaName));
                }
            });
        });
    }
    private getAlive(particle: Particle) {

        this.git = git(path.resolve(__dirname, particle.data.repositoryDirectory));

        /**
         * send a notification to the Cytoplasm
         * to inform about the organelle has been ready to get requests
         * */
        this.send(new euglena_template.alive.particle.OrganelleHasComeToLife(this.name, this.sapContent.euglenaName));
    }
}

export namespace particles {
    export namespace incoming {
        export interface SapContent {
            euglenaName: string,
            repositoryDirectory: string
        }
        export class Sap extends euglena.ParticleV2<SapContent>{
            public static readonly NAME = Organelle.NAME + ".sap";

            /**
             *  TODO:
             * Add fields needed from outside
             * before started the organelle working
             */

            constructor(of: string, data: SapContent) {
                super(new euglena.MetaV2(Sap.NAME, of), data);
            }
        }
        export class AddAndCommit extends euglena.ParticleV2<{ filePath: string, commitMessage: string }>{
            public static readonly NAME = "AddAndCommit";
            constructor(content: { filePath: string, commitMessage: string }, of: string) {
                super(new euglena.MetaV2(AddAndCommit.NAME, of), content);
            }
        }
        export class Push extends euglena.ParticleV2<{}>{
            public static readonly NAME = "Push";
            constructor(of: string) {
                super(new euglena.MetaV2(AddAndCommit.NAME, of));
            }
        }
    }
    export namespace outgoing {
        export class ASyncEnd extends euglena.ParticleV2<any>{
            public static readonly NAME = "ASyncEnd";
            constructor(of: string, data?: any) {
                super(new euglena.MetaV2(ASyncEnd.NAME, of), data);
            }
        }
    }
    export namespace shared {

    }
}
