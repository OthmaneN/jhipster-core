/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const merge = require('../utils/object_utils').merge;
const isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;
const JDLEntity = require('./jdl_entity');
const Set = require('../utils/objects/set');
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

class AbstractJDLOption {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name) {
      throw new BuildException(exceptions.NullPointer, 'The option\'s name must be passed.');
    }
    this.name = merged.name;
    this.entityNames = new Set(merged.entityNames);
    if (this.entityNames.size() === 0) {
      this.entityNames.add('*');
    }
    this.excludedNames = new Set(merged.excludedNames);
  }

  addEntity(entity) {
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The passed entity must be valid.\nErrors: ${errors.join(', ')}`);
    }
    if (this.excludedNames.has(entity.name)) {
      return false;
    }
    if (this.entityNames.has('*')) {
      this.entityNames.remove('*');
    }
    return this.entityNames.add(entity.name);
  }

  addEntitiesFromAnotherOption(option) {
    if (!option || !AbstractJDLOption.isValid(option)) {
      return false;
    }
    this.entityNames.addSetElements(option.entityNames);
    this.excludedNames.addSetElements(option.excludedNames);
    return true;
  }

  excludeEntity(entity) {
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The passed entity must be valid.\nErrors: ${errors.join(', ')}`);
    }
    if (this.entityNames.has(entity.name)) {
      return false;
    }
    return this.excludedNames.add(entity.name);
  }

  getType() {
    throw new BuildException(exceptions.UnsupportedOperation);
  }

  static checkValidity(object) {
    const errors = [];
    if (!object) {
      errors.push(ErrorCases.options.NoOption);
      return errors;
    }
    if (isNilOrEmpty(object.name)) {
      errors.push(ErrorCases.options.NoName);
    }
    if (!object.entityNames) {
      errors.push(ErrorCases.options.NoEntityNames);
    }
    if (object.entityNames && object.entityNames.has(null)) {
      errors.push(ErrorCases.options.NilInEntityNames);
    }
    if (!object.excludedNames) {
      errors.push(ErrorCases.options.NoExcludedNames);
    }
    if (object.excludedNames && object.excludedNames.has(null)) {
      errors.push(ErrorCases.options.NilInExcludedNames);
    }
    try {
      object.getType();
    } catch (error) {
      errors.push(ErrorCases.options.NoType);
    }
    return errors;
  }

  static isValid(object) {
    const errors = this.checkValidity(object);
    return errors.length === 0;
  }
}

module.exports = AbstractJDLOption;

function defaults() {
  return {
    entityNames: new Set(['*']),
    excludedNames: new Set()
  };
}
