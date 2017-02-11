import Resume from '../models/resumes';
import ResumePub from '../models/resume-pub';

const getResume = async (ctx, next) => {
  const userId = ctx.session.userId;
  const getResult = await Resume.getResume(userId);
  const { message, result } = getResult;
  ctx.body = {
    success: true,
    result
  };
};

const setResume = async (ctx, next) => {
  const { resume } = ctx.query;
  const resumeObj = JSON.parse(resume);
  const { userId } = ctx.session;

  const setResult = await Resume.updateResume(userId, resumeObj);
  if (setResult.success) {
    // check & add resume share info
    const checkResult = await ResumePub.checkPubResume({ userId });
    if (!checkResult.success) { await ResumePub.addPubResume(userId) }
  }

  ctx.body = {
    success: true,
    message: '储存成功',
    result: setResult.result
  };
};

const getPubResume = async (ctx, next) => {
  const { hash } = ctx.params;
  const findResume = await ResumePub.getPubResume(hash);
  const { success, result, message } = findResume;

  ctx.body = {
    message,
    result,
    success: true
  };
};

const getPubResumePage = async (ctx, next) => {
  const { hash } = ctx.params;
  const findResume = await ResumePub.checkPubResume({
    resumeHash: hash
  });
  const { success, result } = findResume;
  if (!success) {
    ctx.redirect('/404');
    return;
  }

  await ctx.render('resume/share', {
    title: `${result}的个人简历`,
    resumeHash: hash
  });
};

const getResumeStatus = async (ctx, next) => {
  const { userId } = ctx.session;
  const findPubResume = await ResumePub.findPublicResume({ userId });
  const { result, success, message } = findPubResume;
  if (!success) {
    ctx.body = {
      error: message,
      success: true
    };
    return
  }

  ctx.body = {
    success: true,
    result: {
      url: `resume/${result.resumeHash}`,
      openShare: result.openShare
    }
  }
};

const setResumeStatus = async (ctx, next) => {
  const { enable } = ctx.query;
  const { userId } = ctx.session;
  const findPubResume = await ResumePub.findPublicResume({ userId });
  const { result, success, message } = findPubResume;
  if (!success) {
    ctx.body = {
      error: message,
      success: true
    };
    return
  }
  await ResumePub.updatePubResume(userId, result.resumeHash, {
    openShare: enable
  });
  const text = enable === 'true' ? '开启' : '关闭';
  ctx.body = {
    success: true,
    message: `分享链接已${text}`
  };
};

export default {
  getResume,
  setResume,
  getPubResume,
  getPubResumePage,
  getResumeStatus,
  setResumeStatus
}