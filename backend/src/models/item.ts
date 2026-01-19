export interface Item {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateItemInput {
  title: string;
  description: string;
  completed?: boolean;
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
