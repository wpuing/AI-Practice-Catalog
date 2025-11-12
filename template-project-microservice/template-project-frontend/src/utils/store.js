/**
 * 状态管理器
 * 基于观察者模式的简单状态管理
 */

import logger from './logger.js';

class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
    this.mutations = {};
    this.actions = {};
  }

  /**
   * 获取状态
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 设置状态
   */
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notifyListeners(prevState, this.state);
    logger.debug('State updated', { prevState, newState: this.state });
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(prevState, nextState) {
    this.listeners.forEach(listener => {
      try {
        listener(nextState, prevState);
      } catch (error) {
        logger.error('Listener error', error);
      }
    });
  }

  /**
   * 注册 mutation
   */
  registerMutation(name, mutation) {
    this.mutations[name] = mutation;
  }

  /**
   * 提交 mutation
   */
  commit(name, payload) {
    const mutation = this.mutations[name];
    if (!mutation) {
      logger.warn(`Mutation "${name}" not found`);
      return;
    }

    const prevState = { ...this.state };
    const result = mutation(this.state, payload);
    if (result) {
      this.state = { ...this.state, ...result };
    }
    this.notifyListeners(prevState, this.state);
    logger.debug(`Mutation "${name}" committed`, { payload, state: this.state });
  }

  /**
   * 注册 action
   */
  registerAction(name, action) {
    this.actions[name] = action;
  }

  /**
   * 分发 action
   */
  async dispatch(name, payload) {
    const action = this.actions[name];
    if (!action) {
      logger.warn(`Action "${name}" not found`);
      return;
    }

    try {
      const result = await action({
        state: this.getState(),
        commit: (mutationName, mutationPayload) => this.commit(mutationName, mutationPayload),
        dispatch: (actionName, actionPayload) => this.dispatch(actionName, actionPayload)
      }, payload);

      logger.debug(`Action "${name}" dispatched`, { payload, result });
      return result;
    } catch (error) {
      logger.error(`Action "${name}" failed`, error);
      throw error;
    }
  }
}

// 导出单例
export default new Store();

