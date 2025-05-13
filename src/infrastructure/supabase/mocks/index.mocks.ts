import { supabase } from "@infrastructure/supabase";

const supabaseThenSpy = jest.fn();
const supabaseSelectSpy = jest.fn();
const supabaseEqSpy = jest.fn();
const supabaseUpsertSpy = jest.fn();
const supabaseDeleteSpy = jest.fn();
const supabaseUpdateSpy = jest.fn();
const supabaseInSpy = jest.fn();
const supabaseInsertSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    delete: supabaseDeleteSpy.mockReturnThis(),
    eq: supabaseEqSpy.mockReturnThis(),
    in: supabaseInSpy.mockReturnThis(),
    insert: supabaseInsertSpy.mockReturnThis(),
    select: supabaseSelectSpy.mockReturnThis(),
    then: supabaseThenSpy,
    update: supabaseUpdateSpy.mockReturnThis(),
    upsert: supabaseUpsertSpy.mockReturnThis(),
  } as never;
});

const spies = {
  supabase: {
    delete: supabaseDeleteSpy,
    eq: supabaseEqSpy,
    from: supabaseFromSpy,
    in: supabaseInSpy,
    insert: supabaseInsertSpy,
    select: supabaseSelectSpy,
    then: supabaseThenSpy,
    update: supabaseUpdateSpy,
    upsert: supabaseUpsertSpy,
  },
};

export { spies };
