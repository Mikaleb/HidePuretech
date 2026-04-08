export type Motor = {
  title: string;
  active: boolean;
  pattern: string;
};

export type AppState = {
  loading: boolean;
  newMotor?: Partial<Motor>;
  newWebsite?: {
    title: string;
    url: string;
    active: boolean;
  };
  motors: Motor[];
  websites: {
    title: string;
    url: string;
    active: boolean;
  }[];
};
