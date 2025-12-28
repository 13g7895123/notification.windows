import Store from 'electron-store';

export interface AppConfig {
    domain: string;
    project: string;
    interval: number;
    debug: boolean;
}

const defaultConfig: AppConfig = {
    domain: 'http://localhost:9204',
    project: '',
    interval: 5,
    debug: false,
};

export class ConfigManager {
    private store: Store<AppConfig>;

    constructor() {
        this.store = new Store<AppConfig>({
            name: 'config',
            defaults: defaultConfig,
            schema: {
                domain: {
                    type: 'string',
                    default: 'http://localhost:9204',
                },
                project: {
                    type: 'string',
                    default: '',
                },
                interval: {
                    type: 'number',
                    minimum: 1,
                    maximum: 3600,
                    default: 5,
                },
                debug: {
                    type: 'boolean',
                    default: false,
                },
            },
        });
    }

    getConfig(): AppConfig {
        return {
            domain: this.store.get('domain'),
            project: this.store.get('project'),
            interval: this.store.get('interval'),
            debug: this.store.get('debug'),
        };
    }

    saveConfig(config: Partial<AppConfig>): void {
        if (config.domain !== undefined) {
            this.store.set('domain', config.domain);
        }
        if (config.project !== undefined) {
            this.store.set('project', config.project);
        }
        if (config.interval !== undefined) {
            this.store.set('interval', config.interval);
        }
        if (config.debug !== undefined) {
            this.store.set('debug', config.debug);
        }
    }

    resetConfig(): void {
        this.store.clear();
    }
}
