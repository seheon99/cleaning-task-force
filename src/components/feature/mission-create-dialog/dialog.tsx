"use client";

import { sample } from "es-toolkit";
import { createContext, useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { createMission, createParticipant, createRole } from "@/actions";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  FieldGroup,
  Fieldset,
} from "@/components/base";
import { User } from "@prisma";

import type { SubmitHandler, UseFormReturn } from "react-hook-form";

import { FieldDescription } from "./field-description";
import { FieldMembers } from "./field-members";
import { FieldRoles } from "./field-roles";
import { FieldTitle } from "./field-title";

type Inputs = {
  title: string;
  description: string;
};

export const FormContext = createContext<UseFormReturn<Inputs> | null>(null);

export function MissionCreateDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  const form = useForm<Inputs>();
  const { handleSubmit, reset } = form;

  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submit = useCallback<SubmitHandler<Inputs>>(
    async ({ title, description }) => {
      const { id: missionId } = await createMission({ title, description });
      await Promise.all([
        ...roles.map(({ name }) => createRole({ missionId, name })),
        ...members.map(({ id: userId }) =>
          createParticipant({ userId, missionId })
        ),
      ]);
      close();
    },
    [close, members, roles]
  );

  return (
    <FormContext.Provider value={form}>
      <Dialog open={open} onClose={close}>
        <form onSubmit={handleSubmit(submit)}>
          <DialogTitle>새 미션 만들기</DialogTitle>
          <DialogDescription>
            {sample([
              "하기 싫지만 누군가는 해야 하는 일",
              "꼭 해야 하는 일이 정말로 하기 싫을 때",
            ])}
          </DialogDescription>
          <DialogBody>
            <Fieldset>
              <FieldGroup>
                <FieldTitle />
                <FieldDescription />
                <FieldRoles roles={roles} setRoles={setRoles} />
                <FieldMembers members={members} setMembers={setMembers} />
              </FieldGroup>
            </Fieldset>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={close}>
              취소
            </Button>
            <Button type="submit">만들기</Button>
          </DialogActions>
        </form>
      </Dialog>
    </FormContext.Provider>
  );
}
