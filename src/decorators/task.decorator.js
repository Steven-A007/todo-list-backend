function decorateTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    category_id: task.category_id,
    tags: task.tags ? task.tags.split(',').map(t => {
      const [id, name] = t.split('::');
      return { id, name };
    }) : [],
    created_at: task.created_at,
  };
}

function decorateTaskList(tasks) {
  return tasks.map(decorateTask);
}

module.exports = { decorateTask, decorateTaskList };