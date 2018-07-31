import * as euglena from "@euglena/core";
import Particle = euglena.AnyParticle;
export declare class Organelle extends euglena.alive.Organelle<particles.incoming.SapContent> {
    static readonly NAME: string;
    private sapContent;
    git: any;
    constructor();
    protected bindActions(addAction: (particleName: string, action: (particle: Particle, callback: (particle: Particle) => void) => void) => void): void;
    private getAlive;
}
export declare namespace particles {
    namespace incoming {
        interface SapContent {
            euglenaName: string;
            repositoryDirectory: string;
        }
        class Sap extends euglena.ParticleV2<SapContent> {
            static readonly NAME: string;
            /**
             *  TODO:
             * Add fields needed from outside
             * before started the organelle working
             */
            constructor(of: string, data: SapContent);
        }
        class AddAndCommit extends euglena.ParticleV2<{
            filePath: string;
            commitMessage: string;
        }> {
            static readonly NAME: string;
            constructor(content: {
                filePath: string;
                commitMessage: string;
            }, of: string);
        }
        class Push extends euglena.ParticleV2<{}> {
            static readonly NAME: string;
            constructor(of: string);
        }
    }
    namespace outgoing {
        class ASyncEnd extends euglena.ParticleV2<any> {
            static readonly NAME: string;
            constructor(of: string, data?: any);
        }
    }
    namespace shared {
    }
}
